import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  class_id: string;

  @IsString()
  @IsNotEmpty()
  subject_id: string;

  @IsString()
  @IsNotEmpty()
  timetable_id: string;

  @IsString()
  @IsNotEmpty()
  date: string;
}
