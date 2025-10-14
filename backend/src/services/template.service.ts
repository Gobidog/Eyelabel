import { AppDataSource } from '../config/database';
import { LabelTemplate } from '../entities/LabelTemplate.entity';
import { TemplateType } from '../types/enums';

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
  async getAll(filters: TemplateFilters = {}) {
    const {
      type,
      isActive,
      page = 1,
      limit = 10,
    } = filters;

    const templateRepository = AppDataSource.getRepository(LabelTemplate);
    const queryBuilder = templateRepository.createQueryBuilder('template');

    // Apply filters
    if (type) {
      queryBuilder.andWhere('template.type = :type', { type });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('template.isActive = :isActive', { isActive });
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Sorting
    queryBuilder.orderBy('template.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get template by ID
   */
  async getById(id: string) {
    const templateRepository = AppDataSource.getRepository(LabelTemplate);
    const template = await templateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    return template;
  },

  /**
   * Get templates by type
   */
  async getByType(type: TemplateType) {
    const templateRepository = AppDataSource.getRepository(LabelTemplate);
    return await templateRepository.find({
      where: { type, isActive: true },
      order: { createdAt: 'DESC' },
    });
  },

  /**
   * Get active templates
   */
  async getActive() {
    const templateRepository = AppDataSource.getRepository(LabelTemplate);
    return await templateRepository.find({
      where: { isActive: true },
      order: { type: 'ASC', createdAt: 'DESC' },
    });
  },

  /**
   * Create new template
   */
  async create(data: CreateTemplateData) {
    const templateRepository = AppDataSource.getRepository(LabelTemplate);

    // Validate template data structure
    if (!data.templateData.width || !data.templateData.height) {
      throw new Error('Template width and height are required');
    }

    if (!Array.isArray(data.templateData.elements)) {
      throw new Error('Template elements must be an array');
    }

    const template = templateRepository.create(data);
    return await templateRepository.save(template);
  },

  /**
   * Update template
   */
  async update(id: string, data: UpdateTemplateData) {
    const templateRepository = AppDataSource.getRepository(LabelTemplate);
    const template = await this.getById(id);

    // Validate template data if provided
    if (data.templateData) {
      if (!data.templateData.width || !data.templateData.height) {
        throw new Error('Template width and height are required');
      }

      if (!Array.isArray(data.templateData.elements)) {
        throw new Error('Template elements must be an array');
      }
    }

    Object.assign(template, data);
    return await templateRepository.save(template);
  },

  /**
   * Delete template (soft delete by setting isActive = false)
   */
  async delete(id: string) {
    const template = await this.getById(id);

    // Check if template is being used by any labels
    const templateRepository = AppDataSource.getRepository(LabelTemplate);
    const templateWithLabels = await templateRepository.findOne({
      where: { id },
      relations: ['labels'],
    });

    if (templateWithLabels?.labels && templateWithLabels.labels.length > 0) {
      throw new Error('Cannot delete template that is being used by labels. Deactivate it instead.');
    }

    // Hard delete if no labels use it
    await templateRepository.remove(template);
    return { message: 'Template deleted successfully' };
  },

  /**
   * Toggle template active status
   */
  async toggleActive(id: string) {
    const template = await this.getById(id);
    template.isActive = !template.isActive;

    const templateRepository = AppDataSource.getRepository(LabelTemplate);
    return await templateRepository.save(template);
  },
};
