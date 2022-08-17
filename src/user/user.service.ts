import { Injectable } from '@nestjs/common';

import { JwtUserExtract } from '../auth/auth.controller';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserInfo(user: JwtUserExtract) {
    const { password, ...result } = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },
    });
    return result;
  }
}
