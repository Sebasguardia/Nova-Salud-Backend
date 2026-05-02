import {
  Injectable, ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService }   from '../../../infrastructure/database/prisma.service';
import { AuditService }    from '../../audit/services/audit.service';
import { hashPassword }    from '../../../utils/hash.utils';
import { getPaginationMeta, getSkip } from '../../../utils/pagination.utils';
import { DEFAULT_PERMISSIONS } from '../../../constants/default-permissions.constants';
import { CreateUserDto }       from '../dto/create-user.dto';
import { UpdateUserDto }       from '../dto/update-user.dto';
import { UpdatePermissionsDto } from '../dto/update-permissions.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit:  AuditService,
  ) {}

  async findAll(page = 1, limit = 20, search?: string, role?: Role) {
    const where: any = {
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName:  { contains: search, mode: 'insensitive' } },
          { email:     { contains: search, mode: 'insensitive' } },
          { dni:       { contains: search } },
        ],
      }),
      ...(role && { role }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip: getSkip(page, limit), take: limit,
        include: { permissions: true }, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users.map((u) => this.sanitize(u)), pagination: getPaginationMeta(total, { page, limit }) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { permissions: true } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.sanitize(user);
  }

  async create(dto: CreateUserDto, requesterId: string) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { dni: dto.dni }] },
    });
    if (existing) {
      throw new ConflictException(
        existing.email === dto.email ? 'El correo ya está registrado' : 'El DNI ya está registrado',
      );
    }

    const passwordHash = await hashPassword(dto.dni);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName, lastName: dto.lastName,
        email: dto.email, dni: dto.dni, phone: dto.phone,
        position: dto.position, role: dto.role ?? Role.USER,
        passwordHash, mustChangePassword: true,
        permissions: { create: DEFAULT_PERMISSIONS },
      },
      include: { permissions: true },
    });

    this.audit.log({
      userId:      requesterId,
      module:      'users',
      action:      'create',
      entityId:    user.id,
      entityName:  `${user.firstName} ${user.lastName}`,
      description: `Usuario creado: ${user.email} — Cargo: ${user.position}`,
      after:       { email: user.email, role: user.role, position: user.position },
    });

    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto, requesterId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (emailExists) throw new ConflictException('El correo ya está en uso');
    }

    const updated = await this.prisma.user.update({
      where: { id }, data: dto, include: { permissions: true },
    });

    this.audit.log({
      userId:      requesterId,
      module:      'users',
      action:      'update',
      entityId:    id,
      entityName:  `${user.firstName} ${user.lastName}`,
      description: `Usuario actualizado: ${user.email}`,
      before:      { email: user.email, phone: user.phone, position: user.position },
      after:       { email: updated.email, phone: updated.phone, position: updated.position },
    });

    return this.sanitize(updated);
  }

  async deactivate(id: string, requesterId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.prisma.user.update({ where: { id }, data: { isActive: false } });

    this.audit.log({
      userId:      requesterId,
      module:      'users',
      action:      'delete',
      entityId:    id,
      entityName:  `${user.firstName} ${user.lastName}`,
      description: `Usuario desactivado: ${user.email}`,
      before:      { isActive: true },
      after:       { isActive: false },
    });

    return { message: 'Usuario desactivado correctamente' };
  }

  async toggleActive(id: string, requesterId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const updated = await this.prisma.user.update({
      where: { id }, data: { isActive: !user.isActive }, include: { permissions: true },
    });

    this.audit.log({
      userId:      requesterId,
      module:      'users',
      action:      'update',
      entityId:    id,
      entityName:  `${user.firstName} ${user.lastName}`,
      description: `Usuario ${updated.isActive ? 'activado' : 'desactivado'}: ${user.email}`,
      before:      { isActive: user.isActive },
      after:       { isActive: updated.isActive },
    });

    return this.sanitize(updated);
  }

  async updatePermissions(id: string, dto: UpdatePermissionsDto, requesterId: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { permissions: true } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await Promise.all(
      dto.permissions.map((p) =>
        this.prisma.userPermission.upsert({
          where:  { userId_module: { userId: id, module: p.module } },
          update: { canAccess: p.canAccess, canCreate: p.canCreate, canEdit: p.canEdit, canDelete: p.canDelete },
          create: { userId: id, module: p.module, canAccess: p.canAccess, canCreate: p.canCreate, canEdit: p.canEdit, canDelete: p.canDelete },
        }),
      ),
    );

    this.audit.log({
      userId:      requesterId,
      module:      'users',
      action:      'permission_change',
      entityId:    id,
      entityName:  `${user.firstName} ${user.lastName}`,
      description: `Permisos actualizados para: ${user.email}`,
      before:      { permissions: user.permissions },
      after:       { permissions: dto.permissions },
    });

    return this.findOne(id);
  }

  async resetPassword(id: string, requesterId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const passwordHash = await hashPassword(user.dni);
    await this.prisma.user.update({ where: { id }, data: { passwordHash, mustChangePassword: true } });

    this.audit.log({
      userId:      requesterId,
      module:      'users',
      action:      'password_reset',
      entityId:    id,
      entityName:  `${user.firstName} ${user.lastName}`,
      description: `Contraseña restablecida al DNI para: ${user.email}`,
    });

    return { message: 'Contraseña restablecida al DNI correctamente' };
  }

  private sanitize(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}