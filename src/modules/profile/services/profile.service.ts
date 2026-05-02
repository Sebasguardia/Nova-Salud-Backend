import {
  Injectable, NotFoundException,
  ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService }          from '../../../infrastructure/database/prisma.service';
import { comparePassword, hashPassword } from '../../../utils/hash.utils';
import { UpdateProfileDto }       from '../dto/update-profile.dto';
import { ChangePasswordProfileDto } from '../dto/change-password-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where:   { id: userId },
      include: { permissions: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.email && dto.email !== user.email) {
      const exists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (exists) throw new ConflictException('El correo ya está en uso');
    }

    const updated = await this.prisma.user.update({
      where:   { id: userId },
      data:    dto,
      include: { permissions: true },
    });

    const { passwordHash, ...safe } = updated;
    return safe;
  }

  async changePassword(userId: string, dto: ChangePasswordProfileDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const valid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('La contraseña actual es incorrecta');

    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException('La nueva contraseña no puede ser igual a la actual');
    }

    const newHash = await hashPassword(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data:  { passwordHash: newHash },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}