export const DEFAULT_PERMISSIONS = [
  { module: 'dashboard', canAccess: true,  canCreate: false, canEdit: false, canDelete: false },
  { module: 'sales',     canAccess: true,  canCreate: true,  canEdit: false, canDelete: false },
  { module: 'clients',   canAccess: true,  canCreate: false, canEdit: false, canDelete: false },
  { module: 'reports',   canAccess: true,  canCreate: false, canEdit: false, canDelete: false },
];

export const ALL_MODULES = [
  'dashboard',
  'sales',
  'clients',
  'reports',
  'inventory',
  'audit',
  'users',
  'settings',
];