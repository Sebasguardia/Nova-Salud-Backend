import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface ParsedPagination {
  page: number;
  limit: number;
}

@Injectable()
export class ParsePaginationPipe implements PipeTransform {
  transform(value: any): ParsedPagination {
    const page  = parseInt(value?.page  ?? '1',  10);
    const limit = parseInt(value?.limit ?? '20', 10);

    if (isNaN(page)  || page  < 1)   throw new BadRequestException('page debe ser mayor a 0');
    if (isNaN(limit) || limit < 1)   throw new BadRequestException('limit debe ser mayor a 0');
    if (limit > 100)                  throw new BadRequestException('limit no puede superar 100');

    return { page, limit };
  }
}