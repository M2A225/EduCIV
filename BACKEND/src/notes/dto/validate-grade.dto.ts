import { IsString, IsOptional } from 'class-validator';

export class ValidateGradeDto {
  @IsString()
  @IsOptional()
  rejection_reason?: string;
}
