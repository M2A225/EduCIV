import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSchoolYearDto {
  @IsString()
  @IsNotEmpty()
  year_range: string;
}

export class UpdateSchoolYearDto {
  @IsString()
  @IsNotEmpty()
  year_range?: string;
}
