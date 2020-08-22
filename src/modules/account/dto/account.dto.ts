import {
  IsNotEmpty,
  IsNumber,
  MaxLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class NewBillDto {
  @IsNotEmpty()
  @IsNumber()
  bill: number;

  @IsNotEmpty()
  @MaxLength(100)
  description: string;

  @IsBoolean()
  @IsOptional()
  credited: boolean;
}
