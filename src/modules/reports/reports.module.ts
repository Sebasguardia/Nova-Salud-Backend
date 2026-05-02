import { Module } from '@nestjs/common';
import { ReportsController }       from './controllers/reports.controller';
import { ReportsService }          from './services/reports.service';
import { ReportAggregatorService } from './services/report-aggregator.service';

@Module({
  controllers: [ReportsController],
  providers:   [ReportsService, ReportAggregatorService],
  exports:     [ReportsService],
})
export class ReportsModule {}