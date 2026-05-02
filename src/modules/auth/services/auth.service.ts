import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { comparePassword, hashPassword } from '../../../utils/hash.utils';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { permissions: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await comparePassword(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
      permissions: user.permissions.map((p) => ({
        module:    p.module,
        canAccess: p.canAccess,
        canCreate: p.canCreate,
        canEdit:   p.canEdit,
        canDelete: p.canDelete,
      })),
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      mustChangePassword: user.mustChangePassword,
      user: {
        id:          user.id,
        firstName:   user.firstName,
        lastName:    user.lastName,
        email:       user.email,
        role:        user.role,
        permissions: payload.permissions,
      },
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<AuthResponse> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { permissions: true },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const currentValid = await comparePassword(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!currentValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException(
        'La nueva contraseña no puede ser igual a la actual',
      );
    }

    const newHash = await hashPassword(dto.newPassword);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash:       newHash,
        mustChangePassword: false,
      },
      include: { permissions: true },
    });

    const payload: JwtPayload = {
      userId: updatedUser.id,
      role:   updatedUser.role,
      permissions: updatedUser.permissions.map((p) => ({
        module:    p.module,
        canAccess: p.canAccess,
        canCreate: p.canCreate,
        canEdit:   p.canEdit,
        canDelete: p.canDelete,
      })),
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      mustChangePassword: false,
      user: {
        id:          updatedUser.id,
        firstName:   updatedUser.firstName,
        lastName:    updatedUser.lastName,
        email:       updatedUser.email,
        role:        updatedUser.role,
        permissions: payload.permissions,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { permissions: true },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const { passwordHash, ...safe } = user;
    return safe;
  }
}