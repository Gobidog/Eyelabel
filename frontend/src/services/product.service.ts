import api from './api';
import { Product, PaginatedResponse } from '@/types';

export interface ProductFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductData {
  gs1BarcodeNumber: string;
  productCode: string;
  productName: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateProductData {
  productCode?: string;
  productName?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface BulkCreateProductResult {
  message: string;
  created: Product[];
  errors: Array<{ index: number; error: string }>;
}

export const productService = {
  /**
   * Get all products with pagination and filters
   */
  getAll: async (filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<{ product: Product }> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Get product by GS1 barcode
   */
  getByBarcode: async (barcode: string): Promise<{ product: Product }> => {
    const response = await api.get(`/products/barcode/${barcode}`);
    return response.data;
  },

  /**
   * Create new product
   */
  create: async (data: CreateProductData): Promise<{ message: string; product: Product }> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  /**
   * Update product
   */
  update: async (
    id: string,
    data: UpdateProductData
  ): Promise<{ message: string; product: Product }> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete product
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  /**
   * Bulk create products
   */
  bulkCreate: async (
    data: CreateProductData[]
  ): Promise<BulkCreateProductResult> => {
    const response = await api.post('/products/bulk', { products: data });
    return response.data as BulkCreateProductResult;
  },
};
