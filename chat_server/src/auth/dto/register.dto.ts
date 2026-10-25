import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { LoginDto, trimLowercase } from './login.dto';

export class RegisterDto extends LoginDto {
  @Transform(trimLowercase)
  @IsEmail()
  email: string;
}
