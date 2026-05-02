import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordProfileDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'Debe contener al menos una mayúscula' })
  @Matches(/[0-9]/, { message: 'Debe contener al menos un número' })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}