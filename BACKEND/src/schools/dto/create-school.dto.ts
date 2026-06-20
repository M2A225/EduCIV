import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsOptional()
  school_id?: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsOptional()
  @IsEnum(['PRIMAIRE', 'SECONDAIRE', 'LYCEE_TECHNIQUE', 'LYCEE_PROFESSIONNEL'])
  school_type?: string;

  @IsInt()
  @IsOptional()
  school_group_id?: number;
}
