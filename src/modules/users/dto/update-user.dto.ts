import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail({}, { message: 'Correo inválido' })
  @IsOptional()
  email?: string;

  @IsString()
  @Length(8, 8, { message: 'El DNI debe tener exactamente 8 dígitos' })
  @IsOptional()
  dni?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}