export enum UserRole {
  ENGINEER = 'engineer',
  DESIGNER = 'designer',
  APPROVER = 'approver',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface Product {
  id: string;
  gs1BarcodeNumber: string;
  productCode: string;
  productName: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum LabelType {
  PRODUCT = 'product',
  CARTON = 'carton',
}

export enum LabelStatus {
  DRAFT = 'draft',
  IN_DESIGN = 'in_design',
  REVIEW = 'review',
  APPROVED = 'approved',
  SENT = 'sent',
}

export enum TemplateType {
  STANDARD = 'standard',
  CCT_SELECTABLE = 'cct_selectable',
  POWER_SELECTABLE = 'power_selectable',
  EMERGENCY = 'emergency',
}

export interface LabelTemplate {
  id: string;
  name: string;
  type: TemplateType;
  templateData: {
    width: number;
    height: number;
    elements: Array<{
      type: string;
      x: number;
      y: number;
      width: number;
      height: number;
      properties: Record<string, any>;
    }>;
    styles?: Record<string, any>;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  labelType: LabelType;
  status: LabelStatus;
  labelData: {
    design: Record<string, any>;
    fields: Record<string, string>;
    customizations?: Record<string, any>;
  };
  pdfUrl?: string;
  notes?: string;
  productId: string;
  templateId?: string;
  createdById?: string;
  approvedById?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  product?: Product;
  template?: LabelTemplate;
  createdBy?: User;
  approvedBy?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}
