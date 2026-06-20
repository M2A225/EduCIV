import { IsNotEmpty, IsInt, IsEnum } from 'class-validator';

export class MarkAttendanceDto {
  @IsInt()
  @IsNotEmpty()
  student_id: number;

  @IsNotEmpty()
  @IsEnum(['PRESENT', 'ABSENT', 'LATE'])
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}
