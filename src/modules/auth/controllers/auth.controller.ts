import { Body, Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, dto);
  }

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.userId);
  }
}