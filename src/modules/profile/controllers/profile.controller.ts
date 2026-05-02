import { Controller, Get, Put, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import type { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { ProfileService }           from '../services/profile.service';
import { UpdateProfileDto }         from '../dto/update-profile.dto';
import { ChangePasswordProfileDto } from '../dto/change-password-profile.dto';
import { CurrentUser }              from '../../../shared/decorators/current-user.decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.profileService.getProfile(user.userId);
  }

  @Put()
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.userId, dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordProfileDto,
  ) {
    return this.profileService.changePassword(user.userId, dto);
  }
}