import { Request, Response, NextFunction } from 'express';
import { templateService } from '../services/template.service';
import { TemplateType } from '../types/enums';

export const templateController = {
  /**
   * Get all templates
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, isActive, page, limit } = req.query;

      const filters = {
        type: type as TemplateType,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      };

      const result = await templateService.getAll(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get template by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const template = await templateService.getById(id);
      res.json({ template });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get templates by type
   */
  async getByType(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const templates = await templateService.getByType(type as TemplateType);
      res.json({ templates });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get active templates
   */
  async getActive(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templates = await templateService.getActive();
      res.json({ templates });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new template
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, type, templateData, isActive } = req.body;

      // Validation
      if (!name || !type || !templateData) {
        res.status(400).json({
          error: 'Name, type, and templateData are required',
        });
        return;
      }

      if (!Object.values(TemplateType).includes(type)) {
        res.status(400).json({
          error: 'Invalid template type',
        });
        return;
      }

      const template = await templateService.create({
        name,
        type,
        templateData,
        isActive,
      });

      res.status(201).json({
        message: 'Template created successfully',
        template,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update template
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, templateData, isActive } = req.body;

      const template = await templateService.update(id, {
        name,
        templateData,
        isActive,
      });

      res.json({
        message: 'Template updated successfully',
        template,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete template
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await templateService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle template active status
   */
  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const template = await templateService.toggleActive(id);
      res.json({
        message: 'Template status updated successfully',
        template,
      });
    } catch (error) {
      next(error);
    }
  },
};
