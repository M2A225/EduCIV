import { IsArray, IsInt, IsNotEmpty, ArrayMinSize } from 'class-validator';

export class GenerateInvitationDto {
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @IsNotEmpty()
  student_ids: number[];
}
