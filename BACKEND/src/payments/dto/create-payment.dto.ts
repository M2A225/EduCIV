import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @IsPositive()
  amount_fcfa: number;

  @IsString()
  @IsNotEmpty()
  receipt_number: string;
}
