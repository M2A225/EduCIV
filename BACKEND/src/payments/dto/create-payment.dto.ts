import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @IsPositive()
  amount_fcfa: number;

  @IsString()
  @IsNotEmpty()
  receipt_number: string;

  @IsEnum(['SCOLARITE', 'CANTINE', 'INSCRIPTION', 'TRANSPORT', 'AUTRE'])
  @IsNotEmpty()
  payment_type: string;

  @IsDateString()
  @IsNotEmpty()
  payment_date: string;

  @IsInt()
  @IsNotEmpty()
  student_id: number;

  @IsInt()
  @IsOptional()
  plan_id?: number;
}
