import {
  Controller, Get, Post, Put, Delete,
  Patch, Body, Param, Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import type { JwtPayload }     from '../../auth/interfaces/jwt-payload.interface';
import { UsersService }        from '../services/users.service';
import { CreateUserDto }       from '../dto/create-user.dto';
import { UpdateUserDto }       from '../dto/update-user.dto';
import { UpdatePermissionsDto } from '../dto/update-permissions.dto';
import { Roles }               from '../../../shared/decorators/roles.decorator';
import { CurrentUser }         from '../../../shared/decorators/current-user.decorator';

@Controller('users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Query('page')   page   = '1',
    @Query('limit')  limit  = '20',
    @Query('search') search?: string,
    @Query('role')   role?:  Role,
  ) {
    return this.usersService.findAll(+page, +limit, search, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.create(dto, user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.update(id, dto, user.userId);
  }

  @Delete(':id')
  deactivate(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.deactivate(id, user.userId);
  }

  @Patch(':id/toggle-active')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.toggleActive(id, user.userId);
  }

  @Put(':id/permissions')
  updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.updatePermissions(id, dto, user.userId);
  }

  @Post(':id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.resetPassword(id, user.userId);
  }
}