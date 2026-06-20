import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { GradeType } from '@prisma/client';

export class CreateGradeDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(999)
  value: number;

  @IsNotEmpty()
  @IsEnum(GradeType)
  type: GradeType;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsNumber()
  @IsOptional()
  max_score?: number;

  @IsEnum(['EN_ATTENTE', 'VALIDE', 'REJETE'])
  @IsOptional()
  status?: string;

  @IsNotEmpty()
  @IsInt()
  period_id: number;

  @IsNotEmpty()
  @IsInt()
  student_id: number;

  @IsNotEmpty()
  @IsInt()
  subject_id: number;
}
