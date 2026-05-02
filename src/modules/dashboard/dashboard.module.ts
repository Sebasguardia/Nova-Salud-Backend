import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService }    from './services/dashboard.service';
import { AlertsModule }        from '../alerts/alerts.module';

@Module({
  imports:     [AlertsModule],
  controllers: [DashboardController],
  providers:   [DashboardService],
})
export class DashboardModule {}