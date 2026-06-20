import { IsNotEmpty, IsString } from 'class-validator';

export class LinkInvitationDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
