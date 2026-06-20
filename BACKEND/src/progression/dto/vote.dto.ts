import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class VoteDto {
  @IsInt()
  student_id: number;

  @IsEnum(['ADMIS', 'REDOUBLE', 'ABSTENTION'])
  decision: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
