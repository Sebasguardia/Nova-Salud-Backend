import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class AuditFiltersDto extends PaginationDto {
  @IsString() @IsOptional() userId?:    string;
  @IsString() @IsOptional() module?:    string;
  @IsString() @IsOptional() action?:    string;
  @IsString() @IsOptional() entityId?:  string;
  @IsString() @IsOptional() startDate?: string;
  @IsString() @IsOptional() endDate?:   string;
}