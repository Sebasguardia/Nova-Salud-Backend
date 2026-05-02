export interface AuthResponse {
  token: string;
  mustChangePassword: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    permissions: Array<{
      module: string;
      canAccess: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
    }>;
  };
}