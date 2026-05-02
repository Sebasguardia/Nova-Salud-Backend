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
  iat?: number;
  exp?: number;
}