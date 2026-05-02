import { Controller, Get, Param, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditService }    from '../services/audit.service';
import { AuditFiltersDto } from '../dto/audit-filters.dto';
import { Roles }           from '../../../shared/decorators/roles.decorator';

@Controller('audit')
@Roles(Role.ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query() filters: AuditFiltersDto) {
    return this.auditService.findAll(filters);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId')  userId: string,
    @Query('page')    page  = '1',
    @Query('limit')   limit = '50',
  ) {
    return this.auditService.findByUser(userId, +page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }
}