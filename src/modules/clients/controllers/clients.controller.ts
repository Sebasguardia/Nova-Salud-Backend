import { Controller, Get, Put, Param, Query, Body } from '@nestjs/common';
import { ClientsService }    from '../services/clients.service';
import { ClientFiltersDto }  from '../dto/client-filters.dto';
import { UpdateClientDto }   from '../dto/update-client.dto';
import { RequirePermission } from '../../../shared/decorators/require-permission.decorator';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @RequirePermission('clients', 'canAccess')
  findAll(@Query() filters: ClientFiltersDto) {
    return this.clientsService.findAll(filters);
  }

  @Get('search')
  findByDni(@Query('dni') dni: string) {
    return this.clientsService.findByDni(dni);
  }

  @Get(':id')
  @RequirePermission('clients', 'canAccess')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Get(':id/history')
  @RequirePermission('clients', 'canAccess')
  getHistory(
    @Param('id')    id:    string,
    @Query('page')  page  = '1',
    @Query('limit') limit = '20',
  ) {
    return this.clientsService.getPurchaseHistory(id, +page, +limit);
  }

  @Get(':id/points')
  @RequirePermission('clients', 'canAccess')
  getPoints(@Param('id') id: string) {
    return this.clientsService.getPointsSummary(id);
  }

  @Put(':id')
  @RequirePermission('clients', 'canEdit')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }
}