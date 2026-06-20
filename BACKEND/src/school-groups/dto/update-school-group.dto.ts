import { IsOptional, IsString } from 'class-validator';

export class UpdateSchoolGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  abbreviation?: string;

  @IsString()
  @IsOptional()
  city?: string;
}
