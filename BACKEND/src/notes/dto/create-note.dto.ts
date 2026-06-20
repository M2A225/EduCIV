import { IsNumber, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateNoteDto {
  @IsNumber()
  value: number;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsInt()
  period_id: number;

  @IsInt()
  student_id: number;

  @IsInt()
  subject_id: number;

  @IsInt()
  school_id: number;
}
