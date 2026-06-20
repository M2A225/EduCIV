import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LinkParentDto {
  @IsInt()
  @IsNotEmpty()
  student_id: number;

  @IsInt()
  @IsNotEmpty()
  parent_user_id: number;

  @IsString()
  @IsOptional()
  relation?: string;
}
