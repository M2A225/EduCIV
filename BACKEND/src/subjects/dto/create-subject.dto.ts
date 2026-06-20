import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  coefficient: number;

  @IsNumber()
  @IsOptional()
  max_score?: number;

  @IsString()
  @IsOptional()
  level_group?: string;
}

export class UpdateSubjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  coefficient?: number;

  @IsNumber()
  @IsOptional()
  max_score?: number;

  @IsString()
  @IsOptional()
  level_group?: string;
}
