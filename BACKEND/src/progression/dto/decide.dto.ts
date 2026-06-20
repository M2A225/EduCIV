import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class DecideDto {
  @IsInt()
  student_id: number;

  @IsEnum(['ADMIS', 'REDOUBLE', 'TRANSFERE', 'EXCLU', 'ABANDON'])
  final_decision: string;

  @IsOptional()
  @IsInt()
  next_class_id?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
