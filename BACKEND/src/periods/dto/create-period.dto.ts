import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';

export class CreatePeriodDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @IsEnum([
    'TRIMESTRE_1',
    'TRIMESTRE_2',
    'TRIMESTRE_3',
    'SEMESTRE_1',
    'SEMESTRE_2',
    'COMPOSITION_1',
    'COMPOSITION_2',
    'COMPOSITION_3',
    'COMPOSITION_4',
    'PASSAGE',
  ])
  period_type?: string;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsNumber()
  @IsOptional()
  school_year_id?: number;
}

export class UpdatePeriodDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsEnum([
    'TRIMESTRE_1',
    'TRIMESTRE_2',
    'TRIMESTRE_3',
    'SEMESTRE_1',
    'SEMESTRE_2',
    'COMPOSITION_1',
    'COMPOSITION_2',
    'COMPOSITION_3',
    'COMPOSITION_4',
    'PASSAGE',
  ])
  period_type?: string;

  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  end_date?: string;

  @IsNumber()
  @IsOptional()
  school_year_id?: number;
}
