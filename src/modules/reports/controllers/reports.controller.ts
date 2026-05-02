import {
  Controller, Get, Query, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService }    from '../services/reports.service';
import { ReportFiltersDto }  from '../dto/report-filters.dto';
import { RequirePermission } from '../../../shared/decorators/require-permission.decorator';

@Controller('reports')
@RequirePermission('reports', 'canAccess')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  getSalesSummary(@Query() filters: ReportFiltersDto) {
    return this.reportsService.getSalesSummary(filters);
  }

  @Get('top-products')
  getTopProducts(@Query() filters: ReportFiltersDto) {
    return this.reportsService.getTopProducts(filters);
  }

  @Get('inventory')
  getInventoryStatus() {
    return this.reportsService.getInventoryStatus();
  }

  @Get('clients')
  getTopClients(@Query() filters: ReportFiltersDto) {
    return this.reportsService.getTopClients(filters);
  }

  @Get('points')
  getPointsSummary(@Query() filters: ReportFiltersDto) {
    return this.reportsService.getPointsSummary(filters);
  }

  @Get('export/csv')
  async exportCsv(
    @Query() filters: ReportFiltersDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportCsv(filters);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte.csv"');
    res.send(buffer);
  }
}