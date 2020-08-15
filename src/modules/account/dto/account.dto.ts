import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator';

export class NewBillDto {
  @IsNotEmpty()
  @IsNumber()
  @MaxLength(7)
  bill: number;

  @IsNotEmpty()
  @MaxLength(100)
  description: string;
}
