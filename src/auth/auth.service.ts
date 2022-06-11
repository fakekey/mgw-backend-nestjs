import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { Role } from './enum';
import { ErrorCode, throwHttpException } from '../common/error';
import { LoginDto, LogoutDto, RefreshDto, RegisterDto } from './dto';
import { PrismaService } from '../common/prisma';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type JwtUserExtract = {
  sub: number;
  email: string;
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const password = await hash(registerDto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          ...registerDto,
          password,
          roles: [Role.CUSTOMER],
        },
      });
      return this.hideUser(user);
    } catch (error) {
      error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        throwHttpException(ErrorCode.EMAIL_EXIST);
    }
  }

  async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email },
      });
      await this.verifyPassword(plainTextPassword, user.password);
      return user;
    } catch (error) {
      throwHttpException(ErrorCode.WRONG_CREDENTIALS);
    }
  }

  private verifyPassword = async (
    plainTextPassword: string,
    hashedPassword: string,
  ) => {
    const isPasswordMatching = await compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatching) throwHttpException(ErrorCode.WRONG_CREDENTIALS);
  };

  private hideUser = (user: User) => {
    delete user.id;
    delete user.password;
    delete user.isDeleted;
    delete user.createdAt;
    delete user.updatedAt;
    return user;
  };

  async loginHandler(params: { user: User; loginDto: LoginDto; req: Request }) {
    const { user, loginDto, req } = params;
    const sub = user.id;
    await this.prisma.session.deleteMany({
      where: {
        userId: sub,
        platform: loginDto.platform,
        device: loginDto.device,
        ipAddress: req.ip,
        isLogout: false,
      },
    });
    const token = await this.getTokens(user.email, sub);
    const hashedRefreshToken = await hash(token.refreshToken, 10);
    await this.prisma.session.create({
      data: {
        accessToken: token.accessToken,
        refreshToken: hashedRefreshToken,
        platform: loginDto.platform,
        device: loginDto.device,
        userId: sub,
        ipAddress: req.ip,
      },
    });
    return {
      ...token,
      user: this.hideUser(user),
    };
  }

  private async getTokens(email: string, sub: number): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub,
          email,
        },
        {
          secret: this.configService.get('ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get('ACCESS_TOKEN_LONG_LIFE'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub,
          email,
        },
        {
          secret: this.configService.get('REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get('REFRESH_TOKEN_LONG_LIFE'),
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(params: {
    user: JwtUserExtract;
    logoutDto: LogoutDto;
    req: Request;
  }) {
    const { user, logoutDto, req } = params;
    await this.prisma.session.updateMany({
      where: {
        userId: user.sub,
        platform: logoutDto.platform,
        device: logoutDto.device,
        ipAddress: req.ip,
        refreshToken: {
          not: null,
        },
        isLogout: false,
      },
      data: {
        refreshToken: null,
        isLogout: true,
      },
    });
    return null;
  }

  async refreshToken(params: {
    user: JwtUserExtract;
    refreshDto: RefreshDto;
    req: Request;
    oldRefreshToken: string;
  }) {
    const { user, refreshDto, req, oldRefreshToken } = params;
    const session = await this.prisma.session.findFirst({
      where: {
        userId: user.sub,
        platform: refreshDto.platform,
        device: refreshDto.device,
        ipAddress: req.ip,
        refreshToken: {
          not: null,
        },
        isLogout: false,
      },
    });
    if (!session) throwHttpException(ErrorCode.UNAUTHORIZED);
    if (!(await compare(oldRefreshToken, session.refreshToken)))
      throwHttpException(ErrorCode.UNAUTHORIZED);
    const newToken = await this.getTokens(user.email, user.sub);
    const hashedToken = await hash(newToken.refreshToken, 10);
    await this.prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        refreshToken: hashedToken,
      },
    });
    return newToken;
  }
}
