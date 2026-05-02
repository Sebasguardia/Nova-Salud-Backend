import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PermissionItemDto {
  @IsString()
  @IsNotEmpty()
  module: string;

  @IsBoolean()
  canAccess: boolean;

  @IsBoolean()
  canCreate: boolean;

  @IsBoolean()
  canEdit: boolean;

  @IsBoolean()
  canDelete: boolean;
}

export class UpdatePermissionsDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un permiso' })
  @ValidateNested({ each: true })
  @Type(() => PermissionItemDto)
  permissions: PermissionItemDto[];
}