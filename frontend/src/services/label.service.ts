import api from './api';
import { Label, PaginatedResponse, LabelType, LabelStatus } from '@/types';

export interface LabelFilters {
  status?: LabelStatus;
  labelType?: LabelType;
  productId?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
}

export interface CreateLabelData {
  productId: string;
  templateId: string;
  labelType: LabelType;
  labelData: {
    design: Record<string, any>;
    fields: Record<string, string>;
    customizations?: Record<string, any>;
  };
  specifications?: {
    powerInput?: string;
    temperatureRating?: string;
    ipRating?: string;
    cctOptions?: string;
    powerOptions?: string;
    opticType?: string;
    classRating?: string;
    additionalSpecs?: Record<string, any>;
  };
  notes?: string;
}

export interface UpdateLabelData {
  labelData?: {
    design: Record<string, any>;
    fields: Record<string, string>;
    customizations?: Record<string, any>;
  };
  notes?: string;
  pdfUrl?: string;
}

export const labelService = {
  /**
   * Get all labels with pagination and filters
   */
  getAll: async (filters: LabelFilters = {}): Promise<PaginatedResponse<Label>> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.labelType) params.append('labelType', filters.labelType);
    if (filters.productId) params.append('productId', filters.productId);
    if (filters.createdBy) params.append('createdBy', filters.createdBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/labels?${params.toString()}`);
    return response.data;
  },

  /**
   * Get label by ID
   */
  getById: async (id: string): Promise<{ label: Label }> => {
    const response = await api.get(`/labels/${id}`);
    return response.data;
  },

  /**
   * Get current user's labels
   */
  getMyLabels: async (): Promise<{ labels: Label[] }> => {
    const response = await api.get('/labels/my-labels');
    return response.data;
  },

  /**
   * Get labels pending approval
   */
  getPendingApproval: async (): Promise<{ labels: Label[] }> => {
    const response = await api.get('/labels/pending-approval');
    return response.data;
  },

  /**
   * Get labels by product ID
   */
  getByProduct: async (productId: string): Promise<{ labels: Label[] }> => {
    const response = await api.get(`/labels/product/${productId}`);
    return response.data;
  },

  /**
   * Create new label
   */
  create: async (data: CreateLabelData): Promise<{ message: string; label: Label }> => {
    const response = await api.post('/labels', data);
    return response.data;
  },

  /**
   * Update label
   */
  update: async (
    id: string,
    data: UpdateLabelData
  ): Promise<{ message: string; label: Label }> => {
    const response = await api.put(`/labels/${id}`, data);
    return response.data;
  },

  /**
   * Update label status
   */
  updateStatus: async (
    id: string,
    status: string
  ): Promise<{ message: string; label: Label }> => {
    const response = await api.patch(`/labels/${id}/status`, { status });
    return response.data;
  },

  /**
   * Update label specifications
   */
  updateSpecifications: async (
    id: string,
    specs: Record<string, any>
  ): Promise<{ message: string; specification: any }> => {
    const response = await api.put(`/labels/${id}/specifications`, specs);
    return response.data;
  },

  /**
   * Delete label (draft only)
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/labels/${id}`);
    return response.data;
  },
};
