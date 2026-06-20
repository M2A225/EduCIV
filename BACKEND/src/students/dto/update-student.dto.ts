import {
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  matricule?: string;

  @IsDateString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  place_birth?: string;

  @IsOptional()
  @IsEnum(['M', 'F'])
  sexe?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsBoolean()
  @IsOptional()
  is_repeater?: boolean;

  @IsString()
  @IsOptional()
  regime?: string;

  @IsBoolean()
  @IsOptional()
  is_internal?: boolean;

  @IsInt()
  @IsOptional()
  class_id?: number;
}
