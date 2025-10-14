/**
 * Product entity interface
 */
export interface Product {
  id: string;
  productCode: string;
  productName: string;
  description?: string;
  gs1BarcodeNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product creation DTO
 */
export interface CreateProductDto {
  productCode: string;
  productName: string;
  description?: string;
  gs1BarcodeNumber: string;
}

/**
 * Product update DTO
 */
export interface UpdateProductDto {
  productCode?: string;
  productName?: string;
  description?: string;
  gs1BarcodeNumber?: string;
}

/**
 * Bulk product creation DTO
 */
export interface BulkCreateProductDto {
  products: CreateProductDto[];
}
