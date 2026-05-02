import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class ProductFiltersDto extends PaginationDto {
  @IsString() @IsOptional() search?: string;
  @IsString() @IsOptional() category?: string;
  @IsString() @IsOptional() pharmaceuticalForm?: string;
  @IsString() @IsOptional() laboratory?: string;
  @IsString() @IsOptional() stockStatus?: string;
  @IsString() @IsOptional() expiryStatus?: string;
  @IsString() @IsOptional() sortBy?: string;
}