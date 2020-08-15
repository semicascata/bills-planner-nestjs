import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { Role } from '../interface/user.interface';

export class NewUserDto {
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(30)
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @MinLength(6)
  confirm_password: string;

  @IsOptional()
  role: Role;
}
