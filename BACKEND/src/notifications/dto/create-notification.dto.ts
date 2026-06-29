import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  school_id: number;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  link?: string;
}
