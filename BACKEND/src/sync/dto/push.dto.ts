import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class PushDto {
  @IsString()
  @IsNotEmpty()
  client_operation_id: string;

  @IsString()
  @IsNotEmpty()
  entity: 'payment' | 'note' | 'attendance';

  @IsString()
  @IsNotEmpty()
  entity_id: string;

  @IsObject()
  @IsNotEmpty()
  payload: any;
}
