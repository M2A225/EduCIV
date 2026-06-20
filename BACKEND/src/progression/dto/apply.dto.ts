import { IsInt } from 'class-validator';

export class ApplyDto {
  @IsInt()
  school_year_id: number;
}
