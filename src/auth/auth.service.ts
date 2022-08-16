import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { isEqual } from 'lodash';

import { ErrorCode, throwHttpException } from '../common/error/error';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtUserExtract } from './auth.controller';
import { RegisterDto } from './dto/register.dto';
import { Role } from './enum/enum';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private readonly env: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const password = await hash(dto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          ...dto,
          password,
          roles: [Role.Employee],
        },
      });
      delete user.password;
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throwHttpException(ErrorCode.EMAIL_EXISTED);
        }
      }
    }
  }

  async getAuthenticatedUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email },
      });
      await this.verifyPassword(password, user.password);
      return user;
    } catch (error) {
      throwHttpException(ErrorCode.WRONG_CREDENTIALS);
    }
  }

  private async verifyPassword(plain: string, hashed: string) {
    const isPasswordMatching = await compare(plain, hashed);
    if (!isPasswordMatching) throwHttpException(ErrorCode.WRONG_CREDENTIALS);
  }

  async loginHandler(params: { user: User; device: any }) {
    const { user, device } = params;
    const sub = user.id;
    await this.prisma.session.deleteMany({
      where: {
        userId: sub,
        isLogout: false,
        info: {
          equals: device,
        },
      },
    });
    const token = await this.getTokens(user.email, sub);
    await this.prisma.session.create({
      data: {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        info: device,
        userId: sub,
      },
    });
    return token;
  }

  private async getTokens(email: string, sub: number): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        {
          sub,
          email,
        },
        {
          secret: this.env.get('ACCESS_TOKEN_SECRET'),
          expiresIn: this.env.get('ACCESS_TOKEN_LIFE_LONG'),
        },
      ),
      this.jwt.signAsync(
        {
          sub,
          email,
        },
        {
          secret: this.env.get('REFRESH_TOKEN_SECRET'),
          expiresIn: this.env.get('REFRESH_TOKEN_LIFE_LONG'),
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async logoutHandler(params: { user: JwtUserExtract }) {
    const { user } = params;
    const { accessToken } = user as any;
    await this.prisma.session.updateMany({
      where: {
        userId: user.sub,
        accessToken,
      },
      data: {
        accessToken: null,
        refreshToken: null,
        isLogout: true,
      },
    });
    return null;
  }

  async refreshHandler(params: { user: JwtUserExtract; device: any }) {
    const { user, device } = params;
    const { refreshToken } = user as any;
    const session = await this.prisma.session.findFirst({
      where: {
        userId: user.sub,
        refreshToken: refreshToken,
      },
    });
    if (!session) {
      throwHttpException(ErrorCode.UNAUTHORIZED);
    }
    if (!isEqual(device, session.info)) {
      throwHttpException(ErrorCode.UNAUTHORIZED);
    }
    const newToken = await this.getTokens(user.email, user.sub);
    await this.prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        accessToken: newToken.accessToken,
        refreshToken: newToken.refreshToken,
      },
    });
    return newToken;
  }
}

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};
