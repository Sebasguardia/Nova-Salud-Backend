export interface CreateAuditEntry {
  userId:      string;
  module:      string;
  action:      string;
  entityId?:   string;
  entityName?: string;
  description: string;
  before?:     Record<string, any>;
  after?:      Record<string, any>;
  ipAddress?:  string;
}