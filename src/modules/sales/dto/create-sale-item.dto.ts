import { IsInt, IsPositive, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
  @IsUUID('4', { message: 'productId inválido' })
  productId: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  quantity: number;
}