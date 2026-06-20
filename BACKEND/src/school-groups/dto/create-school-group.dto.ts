import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSchoolGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  abbreviation?: string;

  @IsString()
  @IsOptional()
  city?: string;
}
