import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTimetableDto {
  @IsString()
  @IsNotEmpty()
  class_id: string;

  @IsString()
  @IsNotEmpty()
  teacher_id: string;

  @IsString()
  @IsNotEmpty()
  subject_id: string;

  @IsString()
  @IsNotEmpty()
  slot: string; // e.g., 'Mon-9:00'
}
