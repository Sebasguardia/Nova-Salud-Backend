export interface AuditEntry {
  id:          string;
  userId:      string;
  module:      string;
  action:      string;
  entityId?:   string | null;
  entityName?: string | null;
  description: string;
  before?:     any;
  after?:      any;
  ipAddress?:  string | null;
  createdAt:   Date;
  user: {
    firstName: string;
    lastName:  string;
    email:     string;
  };
}