/**
 * Template type enumeration
 */
export enum TemplateType {
  STANDARD = 'standard',
  CCT_SELECTABLE = 'cct_selectable',
  POWER_SELECTABLE = 'power_selectable',
  EMERGENCY = 'emergency',
}

/**
 * Template entity interface
 */
export interface LabelTemplate {
  id: string;
  name: string;
  description?: string;
  type: TemplateType;
  width: number;
  height: number;
  templateData: TemplateData;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Template data structure (stored as JSONB)
 */
export interface TemplateData {
  elements: TemplateElement[];
  backgroundColor?: string;
  gridSize?: number;
  [key: string]: any;
}

/**
 * Template element (for Fabric.js canvas)
 */
export interface TemplateElement {
  type: 'text' | 'rect' | 'circle' | 'barcode' | 'image';
  left: number;
  top: number;
  width?: number;
  height?: number;
  [key: string]: any;
}

/**
 * Template creation DTO
 */
export interface CreateTemplateDto {
  name: string;
  description?: string;
  type: TemplateType;
  width: number;
  height: number;
  templateData: TemplateData;
}

/**
 * Template update DTO
 */
export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  type?: TemplateType;
  width?: number;
  height?: number;
  templateData?: TemplateData;
  isActive?: boolean;
}
