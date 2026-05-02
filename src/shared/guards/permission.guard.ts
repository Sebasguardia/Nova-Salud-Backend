import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PERMISSION_KEY, PermissionMetadata } from '../decorators/require-permission.decorator';
import { JwtPayload } from '../interfaces/request-with-user.interface';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.getAllAndOverride<PermissionMetadata>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (!user) throw new ForbiddenException('Sin acceso');

    if (user.role === Role.ADMIN) return true;

    const modulePermission = user.permissions?.find(
      (p) => p.module === permission.module,
    );

    if (!modulePermission || !modulePermission[permission.action]) {
      throw new ForbiddenException(
        `Sin permiso para '${permission.action}' en el módulo '${permission.module}'`,
      );
    }

    return true;
  }
}