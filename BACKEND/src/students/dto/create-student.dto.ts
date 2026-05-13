import { IsNotEmpty, IsString, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsOptional()
  dob?: string;

  @IsInt()
  @IsOptional()
  class_id?: number;
}
