import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { Rule } from '../enum/enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(Rule.MIN_PASSWORD_LENGTH)
  password: string;
}
