import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener mínimo 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'Debe contener al menos una mayúscula' })
  @Matches(/[0-9]/, { message: 'Debe contener al menos un número' })
  newPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'La confirmación es requerida' })
  confirmPassword: string;
}