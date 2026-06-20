import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsInt,
  IsOptional,
  IsEnum,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @IsNotEmpty({ message: 'Email ou téléphone requis' })
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  school_id?: number;

  @IsEnum([
    'DIRECTOR',
    'TEACHER',
    'ACCOUNTANT',
    'CASHIER',
    'EDUCATOR',
    'PARENT',
    'BACKOFFICE',
    'STUDENT',
  ])
  @IsOptional()
  role?: string;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum([
    'DIRECTOR',
    'TEACHER',
    'ACCOUNTANT',
    'CASHIER',
    'EDUCATOR',
    'PARENT',
    'BACKOFFICE',
    'STUDENT',
  ])
  @IsOptional()
  role?: string;
}
