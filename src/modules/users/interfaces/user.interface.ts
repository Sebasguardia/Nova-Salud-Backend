import { Role } from '@prisma/client';

export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  phone: string | null;
  position: string;
  role: Role;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  permissions: Array<{
    module: string;
    canAccess: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }>;
}