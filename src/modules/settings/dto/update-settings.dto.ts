import { IsObject } from 'class-validator';

export class UpdateSettingsDto {
  @IsObject({ message: 'settings debe ser un objeto clave-valor' })
  settings: Record<string, string>;
}