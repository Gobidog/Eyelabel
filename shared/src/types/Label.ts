/**
 * Label status enumeration
 */
export enum LabelStatus {
  DRAFT = 'draft',
  IN_DESIGN = 'in_design',
  REVIEW = 'review',
  APPROVED = 'approved',
  SENT = 'sent',
}

/**
 * Label type enumeration
 */
export enum LabelType {
  PRODUCT = 'product',
  CARTON = 'carton',
}

/**
 * Label entity interface
 */
export interface Label {
  id: string;
  productId: string;
  templateId?: string;
  labelType: LabelType;
  status: LabelStatus;
  labelData: LabelData;
  notes?: string;
  createdById: string;
  approvedById?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Label data structure (stored as JSONB)
 */
export interface LabelData {
  fields: {
    productCode: string;
    productName: string;
    gs1BarcodeNumber: string;
    description?: string;
    [key: string]: any;
  };
  design?: any; // Fabric.js canvas JSON
  preview?: string; // Base64 PNG data URL
}

/**
 * Label creation DTO
 */
export interface CreateLabelDto {
  productId: string;
  templateId?: string;
  labelType: LabelType;
  labelData: LabelData;
  notes?: string;
}

/**
 * Label update DTO
 */
export interface UpdateLabelDto {
  templateId?: string;
  labelType?: LabelType;
  labelData?: LabelData;
  notes?: string;
}

/**
 * Label status update DTO
 */
export interface UpdateLabelStatusDto {
  status: LabelStatus;
  notes?: string;
}
