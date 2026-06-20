import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';

export class UpdateSchoolDto {
  @IsString()
  @IsOptional()
  name?: string;

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

  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsOptional()
  @IsEnum(['PRIMAIRE', 'SECONDAIRE', 'LYCEE_TECHNIQUE', 'LYCEE_PROFESSIONNEL'])
  school_type?: string;

  @IsInt()
  @IsOptional()
  school_group_id?: number;
}
