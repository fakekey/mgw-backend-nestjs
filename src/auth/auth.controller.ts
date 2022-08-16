import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Device, User } from '../common/decorator/decorator';
import { InvalidParameterFilter } from '../common/filter/invalid-paramater.filter';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guard/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';

@Controller('auth')
@UseFilters(InvalidParameterFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@User() user, @Device() device) {
    return await this.authService.loginHandler({ user, device });
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@User() user: JwtUserExtract) {
    return await this.authService.logoutHandler({ user });
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(@User() user: JwtUserExtract, @Device() device) {
    return await this.authService.refreshHandler({ user, device });
  }
}

export type JwtUserExtract = {
  sub: number;
  email: string;
  iat: number;
  exp: number;
};
