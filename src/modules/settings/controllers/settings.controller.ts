import {
  Controller, Get, Put, Post, Delete,
  Body, Param,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { SettingsService }        from '../services/settings.service';
import { UpdateSettingsDto }      from '../dto/update-settings.dto';
import { CreateDiscountRuleDto }  from '../dto/create-discount-rule.dto';
import { UpdateDiscountRuleDto }  from '../dto/update-discount-rule.dto';
import { Roles }                  from '../../../shared/decorators/roles.decorator';

@Controller('settings')
@Roles(Role.ADMIN)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getAll() {
    return this.settingsService.getAll();
  }

  @Put()
  updateMany(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateMany(dto);
  }

  @Get('discounts')
  getDiscountRules() {
    return this.settingsService.getDiscountRules();
  }

  @Post('discounts')
  createDiscountRule(@Body() dto: CreateDiscountRuleDto) {
    return this.settingsService.createDiscountRule(dto);
  }

  @Put('discounts/:id')
  updateDiscountRule(
    @Param('id') id: string,
    @Body() dto: UpdateDiscountRuleDto,
  ) {
    return this.settingsService.updateDiscountRule(id, dto);
  }

  @Delete('discounts/:id')
  deleteDiscountRule(@Param('id') id: string) {
    return this.settingsService.deleteDiscountRule(id);
  }
}