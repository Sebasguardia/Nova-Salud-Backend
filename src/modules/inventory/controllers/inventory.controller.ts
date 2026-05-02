import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query,
} from '@nestjs/common';
import type { JwtPayload }    from '../../auth/interfaces/jwt-payload.interface';
import { InventoryService }   from '../services/inventory.service';
import { CreateProductDto }   from '../dto/create-product.dto';
import { UpdateProductDto }   from '../dto/update-product.dto';
import { ProductFiltersDto }  from '../dto/product-filters.dto';
import { RequirePermission }  from '../../../shared/decorators/require-permission.decorator';
import { CurrentUser }        from '../../../shared/decorators/current-user.decorator';

@Controller('products')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @RequirePermission('inventory', 'canAccess')
  findAll(@Query() filters: ProductFiltersDto) {
    return this.inventoryService.findAll(filters);
  }

  @Get('alerts')
  getAlerts() {
    return this.inventoryService.getAlerts();
  }

  @Get('barcode/:code')
  findByBarcode(@Param('code') code: string) {
    return this.inventoryService.findByBarcode(code);
  }

  @Get(':id')
  @RequirePermission('inventory', 'canAccess')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  @RequirePermission('inventory', 'canCreate')
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.create(dto, user.userId);
  }

  @Put(':id')
  @RequirePermission('inventory', 'canEdit')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.update(id, dto, user.userId);
  }

  @Delete(':id')
  @RequirePermission('inventory', 'canDelete')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.softDelete(id, user.userId);
  }
}