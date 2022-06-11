import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../common/prisma';
import { JwtRefreshStrategy, JwtStrategy, LocalStrategy } from './strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
  imports: [PrismaModule, ConfigModule, JwtModule.register({})],
})
export class AuthModule {}
