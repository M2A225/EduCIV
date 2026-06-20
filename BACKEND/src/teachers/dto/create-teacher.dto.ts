import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsDateString()
  @IsOptional()
  hire_date?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateTeacherDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsDateString()
  @IsOptional()
  hire_date?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
