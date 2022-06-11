import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Rule } from '../enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(Rule.MIN_PASSWORD_LENGTH)
  password: string;
}
