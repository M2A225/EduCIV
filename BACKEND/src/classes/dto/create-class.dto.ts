import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  section?: string;

  @IsInt()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  classroom?: string;

  @IsNumber()
  @IsOptional()
  grade_total_max?: number;

  @IsNumber()
  @IsOptional()
  grade_avg_scale?: number;
}

export class UpdateClassDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  section?: string;

  @IsInt()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  classroom?: string;

  @IsNumber()
  @IsOptional()
  grade_total_max?: number;

  @IsNumber()
  @IsOptional()
  grade_avg_scale?: number;
}
