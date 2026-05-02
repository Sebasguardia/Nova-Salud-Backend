import { Injectable } from '@nestjs/common';
import { ReportAggregatorService } from './report-aggregator.service';
import { ExportService }           from '../../../infrastructure/export/export.service';
import { ReportFiltersDto }        from '../dto/report-filters.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly aggregator: ReportAggregatorService,
    private readonly exporter:   ExportService,
  ) {}

  async getSalesSummary(filters: ReportFiltersDto) {
    const { start, end } = this.aggregator.parseDateRange(filters);
    return this.aggregator.getSalesSummary(start, end, filters.userId);
  }

  async getTopProducts(filters: ReportFiltersDto) {
    const { start, end } = this.aggregator.parseDateRange(filters);
    return this.aggregator.getTopProducts(start, end);
  }

  async getInventoryStatus() {
    return this.aggregator.getInventoryStatus();
  }

  async getTopClients(filters: ReportFiltersDto) {
    const { start, end } = this.aggregator.parseDateRange(filters);
    return this.aggregator.getTopClients(start, end);
  }

  async getPointsSummary(filters: ReportFiltersDto) {
    const { start, end } = this.aggregator.parseDateRange(filters);
    return this.aggregator.getPointsSummary(start, end);
  }

  async exportCsv(filters: ReportFiltersDto): Promise<Buffer> {
    const { start, end } = this.aggregator.parseDateRange(filters);
    const summary        = await this.aggregator.getSalesSummary(start, end);

    const headers = ['Fecha', 'Ventas', 'Ingresos (S/.)'];
    const rows    = summary.chartData.map((d) => ({
      Fecha:           d.label,
      Ventas:          d.sales,
      'Ingresos (S/.)': d.revenue,
    }));

    return this.exporter.toCsvBuffer(headers, rows);
  }
}