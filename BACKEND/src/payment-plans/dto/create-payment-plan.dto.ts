import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';

export class CreatePaymentPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  total_amount: number;
}
