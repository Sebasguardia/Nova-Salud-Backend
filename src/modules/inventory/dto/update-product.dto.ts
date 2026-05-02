import { IsBoolean, IsDateString, IsNumber, IsOptional,
         IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsString() @IsOptional() commercialName?: string;
  @IsString() @IsOptional() genericName?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() category?: string;
  @IsString() @IsOptional() pharmaceuticalForm?: string;
  @IsString() @IsOptional() concentration?: string;
  @IsString() @IsOptional() presentation?: string;
  @IsString() @IsOptional() laboratory?: string;

  @Type(() => Number)
  @IsNumber() @IsPositive() @IsOptional()
  purchasePrice?: number;

  @Type(() => Number)
  @IsNumber() @IsPositive() @IsOptional()
  salePrice?: number;

  @Type(() => Number)
  @IsNumber() @Min(0) @IsOptional()
  currentStock?: number;

  @Type(() => Number)
  @IsNumber() @Min(0) @IsOptional()
  minimumStock?: number;

  @IsDateString() @IsOptional() expirationDate?: string;
  @IsString()     @IsOptional() lot?: string;
  @IsString()     @IsOptional() sku?: string;
  @IsString()     @IsOptional() barcode?: string;
  @IsString()     @IsOptional() physicalLocation?: string;
  @IsBoolean()    @IsOptional() taxApplicable?: boolean;
  @IsString()     @IsOptional() saleUnit?: string;
}