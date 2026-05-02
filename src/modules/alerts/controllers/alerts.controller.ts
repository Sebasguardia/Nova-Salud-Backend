import { Controller, Get } from '@nestjs/common';
import { AlertsService } from '../services/alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  getAll() {
    return this.alertsService.getAll();
  }

  @Get('stock')
  getStockAlerts() {
    return this.alertsService.getStockAlerts();
  }

  @Get('expiry')
  getExpiryAlerts() {
    return this.alertsService.getExpiryAlerts();
  }

  @Get('count')
  getCount() {
    return this.alertsService.getCount();
  }
}