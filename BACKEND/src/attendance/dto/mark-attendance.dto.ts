import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class MarkAttendanceDto {
  @IsString()
  @IsNotEmpty()
  student_id: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PRESENT', 'ABSENT', 'LATE'])
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}
