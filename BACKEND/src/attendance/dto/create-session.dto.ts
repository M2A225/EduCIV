import { IsInt, IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  @IsNotEmpty()
  class_id: number;

  @IsInt()
  @IsNotEmpty()
  subject_id: number;

  @IsInt()
  @IsNotEmpty()
  timetable_id: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
