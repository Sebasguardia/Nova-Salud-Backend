import {
  Controller, Get, Post, Param, Query,
  Body, Res, HttpCode, HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { SalesService }      from '../services/sales.service';
import { CreateSaleDto }     from '../dto/create-sale.dto';
import { SaleFiltersDto }    from '../dto/sale-filters.dto';
import { RequirePermission } from '../../../shared/decorators/require-permission.decorator';
import { CurrentUser }       from '../../../shared/decorators/current-user.decorator';
import type { JwtPayload }   from '../../auth/interfaces/jwt-payload.interface';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('summary/today')
  @RequirePermission('sales', 'canAccess')
  getDailySummary() {
    return this.salesService.getDailySummary();
  }

  @Get()
  @RequirePermission('sales', 'canAccess')
  findAll(@Query() filters: SaleFiltersDto) {
    return this.salesService.findAll(filters);
  }

  @Get(':id/receipt')
  @RequirePermission('sales', 'canAccess')
  async getReceipt(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { filePath, fileName } = await this.salesService.getReceipt(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(filePath, { root: '.' });
  }

  @Get(':id')
  @RequirePermission('sales', 'canAccess')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('sales', 'canCreate')
  create(
    @Body() dto: CreateSaleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.salesService.create(dto, user.userId);
  }
}