import { Controller, Get } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('chart')
  getRevenueChart() {
    return this.dashboardService.getRevenueChart();
  }
}