import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateTimetableDto {
  @IsInt()
  @IsNotEmpty()
  class_id: number;

  @IsInt()
  @IsNotEmpty()
  teacher_id: number;

  @IsInt()
  @IsNotEmpty()
  subject_id: number;

  @IsString()
  @IsNotEmpty()
  slot: string;
}
