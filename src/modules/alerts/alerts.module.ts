import { Module } from '@nestjs/common';
import { AlertsController } from './controllers/alerts.controller';
import { AlertsService }    from './services/alerts.service';

@Module({
  controllers: [AlertsController],
  providers:   [AlertsService],
  exports:     [AlertsService],
})
export class AlertsModule {}