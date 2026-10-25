import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_NAME_PATTERN,
} from '../auth.constants';

export function trimLowercase({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class LoginDto {
  @Transform(trimLowercase)
  @IsString()
  @Length(USER_NAME_MIN_LENGTH, USER_NAME_MAX_LENGTH)
  @Matches(USER_NAME_PATTERN, {
    message: 'name may contain only letters, digits, ".", "_" and "-"',
  })
  name: string;

  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_PATTERN, {
    message: 'password must contain at least one letter and one digit',
  })
  password: string;
}
