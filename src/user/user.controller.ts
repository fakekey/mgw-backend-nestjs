import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { JwtUserExtract } from '../auth/auth.controller';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { User } from '../common/decorator/decorator';
import { InvalidParameterFilter } from '../common/filter/invalid-paramater.filter';
import { UserService } from './user.service';

@Controller('user')
@UseFilters(InvalidParameterFilter)
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get('info')
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@User() user: JwtUserExtract) {
    return await this.userService.getUserInfo(user);
  }
}
