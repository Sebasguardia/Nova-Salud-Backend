import { Module } from '@nestjs/common';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryService }    from './services/inventory.service';
import { AuditModule }         from '../audit/audit.module';

@Module({
  imports:     [AuditModule],
  controllers: [InventoryController],
  providers:   [InventoryService],
  exports:     [InventoryService],
})
export class InventoryModule {}