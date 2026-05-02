import { Module } from '@nestjs/common';
import { SalesController }      from './controllers/sales.controller';
import { SalesService }         from './services/sales.service';
import { CartCalculatorService } from './services/cart-calculator.service';
import { ClientsModule }        from '../clients/clients.module';
import { SettingsModule }       from '../settings/settings.module';

@Module({
  imports:     [ClientsModule, SettingsModule],
  controllers: [SalesController],
  providers:   [SalesService, CartCalculatorService],
  exports:     [SalesService],
})
export class SalesModule {}