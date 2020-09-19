import { IsNotEmpty, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsNotEmpty()
  current: string;

  @IsNotEmpty()
  @MinLength(6)
  newPass: string;
}