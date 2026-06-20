import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateIncidentDto {
  @IsInt()
  student_id: number;

  @IsInt()
  @IsOptional()
  teacher_id?: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['RETARD', 'ABSENCE_NON_JUSTIFIEE', 'COMPORTEMENT', 'AUTRE'])
  type: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  date?: string;
}

export class UpdateIncidentDto {
  @IsString()
  @IsOptional()
  @IsEnum(['RETARD', 'ABSENCE_NON_JUSTIFIEE', 'COMPORTEMENT', 'AUTRE'])
  type?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['EN_COURS', 'RESOLU', 'IGNORE'])
  status?: string;

  @IsString()
  @IsOptional()
  date?: string;
}
