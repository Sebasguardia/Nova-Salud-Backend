import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  lastName: string;

  @IsEmail({}, { message: 'Correo inválido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  email: string;

  @IsString()
  @Length(8, 8, { message: 'El DNI debe tener exactamente 8 dígitos' })
  dni: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty({ message: 'El cargo es requerido' })
  position: string;

  @IsEnum(Role, { message: 'El rol debe ser ADMIN o USER' })
  @IsOptional()
  role?: Role;
}