import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateTeacherSubjectDto {
  @IsInt()
  @IsNotEmpty()
  teacher_id: number;

  @IsInt()
  @IsNotEmpty()
  subject_id: number;

  @IsInt()
  @IsNotEmpty()
  class_id: number;
}
