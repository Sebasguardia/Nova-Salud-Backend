import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class SaleFiltersDto extends PaginationDto {
  @IsString() @IsOptional() startDate?: string;
  @IsString() @IsOptional() endDate?:   string;
  @IsString() @IsOptional() userId?:    string;
  @IsString() @IsOptional() clientId?:  string;
}