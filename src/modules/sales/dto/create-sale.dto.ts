import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsInt,
  IsOptional, IsString, Min, ValidateNested,
} from 'class-validator';
import { CreateSaleItemDto } from './create-sale-item.dto';

export class CreateSaleDto {
  @IsString()  @IsOptional() clientDni?:  string;
  @IsString()  @IsOptional() clientName?: string;
  @IsString()  @IsOptional() clientPhone?: string;
  @IsString()  @IsOptional() notes?:      string;

  @Type(() => Number)
  @IsInt() @Min(0) @IsOptional()
  pointsToUse?: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}