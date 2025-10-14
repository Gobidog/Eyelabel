/**
 * Shared types for Eye Label Creation Tool
 * Used by both frontend and backend
 */

// User types
export * from './User';

// Product types
export * from './Product';

// Label types
export * from './Label';

// Template types
export * from './Template';

// Common API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Authentication types
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: any; // Import User type
}

// Barcode generation types
export interface BarcodeGenerationRequest {
  text: string;
  format?: 'ean13' | 'code128' | 'gs1-128' | 'qrcode';
  height?: number;
  width?: number;
}

export interface BarcodeGenerationResponse {
  success: boolean;
  dataUrl: string;
  format: string;
  text: string;
}
