import { IsNotEmpty, IsInt, IsIn } from 'class-validator';

export class MarkAttendanceDto {
  @IsInt()
  @IsNotEmpty()
  student_id: number;

  @IsNotEmpty()
  @IsIn(['PRESENT', 'ABSENT', 'LATE'])
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}
