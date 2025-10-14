import api from './api';
import { LabelTemplate, PaginatedResponse, TemplateType } from '@/types';

export interface TemplateFilters {
  type?: TemplateType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateTemplateData {
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
  isActive?: boolean;
}

export interface UpdateTemplateData {
  name?: string;
  templateData?: {
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
  isActive?: boolean;
}

export const templateService = {
  /**
   * Get all templates with pagination and filters
   */
  getAll: async (filters: TemplateFilters = {}): Promise<PaginatedResponse<LabelTemplate>> => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/templates?${params.toString()}`);
    return response.data;
  },

  /**
   * Get template by ID
   */
  getById: async (id: string): Promise<{ template: LabelTemplate }> => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  /**
   * Get templates by type
   */
  getByType: async (type: TemplateType): Promise<{ templates: LabelTemplate[] }> => {
    const response = await api.get(`/templates/type/${type}`);
    return response.data;
  },

  /**
   * Get active templates
   */
  getActive: async (): Promise<{ templates: LabelTemplate[] }> => {
    const response = await api.get('/templates/active');
    return response.data;
  },

  /**
   * Create new template
   */
  create: async (data: CreateTemplateData): Promise<{ message: string; template: LabelTemplate }> => {
    const response = await api.post('/templates', data);
    return response.data;
  },

  /**
   * Update template
   */
  update: async (
    id: string,
    data: UpdateTemplateData
  ): Promise<{ message: string; template: LabelTemplate }> => {
    const response = await api.put(`/templates/${id}`, data);
    return response.data;
  },

  /**
   * Toggle template active status
   */
  toggleActive: async (id: string): Promise<{ message: string; template: LabelTemplate }> => {
    const response = await api.patch(`/templates/${id}/toggle-active`);
    return response.data;
  },

  /**
   * Delete template
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  },
};
