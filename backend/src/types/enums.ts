// User roles
export enum UserRole {
  ENGINEER = 'engineer',
  DESIGNER = 'designer',
  APPROVER = 'approver',
  ADMIN = 'admin',
}

// Label types
export enum LabelType {
  PRODUCT = 'product',
  CARTON = 'carton',
}

// Label statuses
export enum LabelStatus {
  DRAFT = 'draft',
  IN_DESIGN = 'in_design',
  REVIEW = 'review',
  APPROVED = 'approved',
  SENT = 'sent',
}

// Template types
export enum TemplateType {
  STANDARD = 'standard',
  CCT_SELECTABLE = 'cct_selectable',
  POWER_SELECTABLE = 'power_selectable',
  EMERGENCY = 'emergency',
}

// Audit action types
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  SEND = 'send',
}
