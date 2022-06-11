import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Platform } from '../enum';

export class LogoutDto {
  @IsEnum(Platform)
  platform: Platform;

  @IsString()
  @IsNotEmpty()
  device: string;
}
