import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class ClientFiltersDto extends PaginationDto {
  @IsString() @IsOptional() search?: string;
}