import {
  IsBoolean, IsDateString, IsNotEmpty, IsNumber,
  IsOptional, IsPositive, IsString, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre comercial es requerido' })
  commercialName: string;

  @IsString()
  @IsOptional()
  genericName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'La categoría es requerida' })
  category: string;

  @IsString()
  @IsOptional()
  pharmaceuticalForm?: string;

  @IsString()
  @IsOptional()
  concentration?: string;

  @IsString()
  @IsOptional()
  presentation?: string;

  @IsString()
  @IsOptional()
  laboratory?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'El precio de compra debe ser un número' })
  @IsPositive({ message: 'El precio de compra debe ser positivo' })
  purchasePrice: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'El precio de venta debe ser un número' })
  @IsPositive({ message: 'El precio de venta debe ser positivo' })
  salePrice: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentStock: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumStock: number;

  @IsDateString({}, { message: 'Fecha de vencimiento inválida' })
  @IsOptional()
  expirationDate?: string;

  @IsString()
  @IsOptional()
  lot?: string;

  @IsString()
  @IsNotEmpty({ message: 'El SKU es requerido' })
  sku: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  physicalLocation?: string;

  @IsBoolean()
  @IsOptional()
  taxApplicable?: boolean;

  @IsString()
  @IsOptional()
  saleUnit?: string;
}