import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthService, JwtUserExtract } from './auth.service';
import { InvalidParameterFilter } from '../common/filter';
import { LoginDto, LogoutDto, RefreshDto, RegisterDto } from './dto';
import { User } from '../common/decorator';
import { User as UserSchema } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard, JwtRefreshAuthGuard, LocalAuthGuard } from './guard';

@Controller('auth')
@UseFilters(InvalidParameterFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @User() user: UserSchema,
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ) {
    return await this.authService.loginHandler({
      user,
      loginDto,
      req,
    });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @User() user: JwtUserExtract,
    @Body() logoutDto: LogoutDto,
    @Req() req: Request,
  ) {
    return await this.authService.logout({
      user,
      logoutDto,
      req,
    });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refreshToken(
    @User() user: JwtUserExtract,
    @Body() refreshDto: RefreshDto,
    @Req() req: Request,
  ) {
    const oldRefreshToken: string = user['refreshToken'];
    return await this.authService.refreshToken({
      user,
      refreshDto,
      req,
      oldRefreshToken,
    });
  }
}
