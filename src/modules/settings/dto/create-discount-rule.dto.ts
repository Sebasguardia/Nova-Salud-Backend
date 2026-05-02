import {
  IsBoolean, IsEnum, IsInt, IsNotEmpty,
  IsNumber, IsOptional, IsString, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '@prisma/client';

export class CreateDiscountRuleDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsEnum(DiscountType, { message: 'Tipo de descuento inválido' })
  type: DiscountType;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value: number;

  @IsString()
  @IsOptional()
  condition?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  priority?: number;
}