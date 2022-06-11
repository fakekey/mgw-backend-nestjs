import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Platform, Rule } from '../enum';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(Rule.MIN_PASSWORD_LENGTH)
  password: string;

  @IsEnum(Platform)
  platform: Platform;

  @IsString()
  @IsNotEmpty()
  device: string;
}
