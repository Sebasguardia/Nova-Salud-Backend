import { Request } from 'express';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  role: Role;
  permissions: Array<{
    module: string;
    canAccess: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }>;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}