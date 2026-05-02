import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class ReportFiltersDto extends PaginationDto {
  @IsString() @IsOptional() period?:    string;
  @IsString() @IsOptional() startDate?: string;
  @IsString() @IsOptional() endDate?:   string;
  @IsString() @IsOptional() userId?:    string;
}