import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

export interface PermissionMetadata {
  module: string;
  action: 'canAccess' | 'canCreate' | 'canEdit' | 'canDelete';
}

export const RequirePermission = (
  module: string,
  action: 'canAccess' | 'canCreate' | 'canEdit' | 'canDelete' = 'canAccess',
) => SetMetadata(PERMISSION_KEY, { module, action });