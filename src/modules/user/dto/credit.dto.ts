import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreditDto {
  @IsNotEmpty()
  @IsNumber()
  credit: number;
}
