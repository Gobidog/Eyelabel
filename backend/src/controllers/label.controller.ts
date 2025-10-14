import { Request, Response, NextFunction } from 'express';
import { LabelService, CreateLabelData } from '../services/label.service';
import { LabelStatus } from '../types/enums';

export class LabelController {
  private labelService: LabelService;

  constructor() {
    this.labelService = new LabelService();
  }

  /**
   * Get all labels
   * GET /api/labels
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, labelType, productId, createdBy, page, limit } = req.query;

      const result = await this.labelService.getAll({
        status: status as LabelStatus,
        labelType: labelType as any,
        productId: productId as string,
        createdBy: createdBy as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get label by ID
   * GET /api/labels/:id
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const label = await this.labelService.getById(id);

      res.status(200).json({ label });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new label
   * POST /api/labels
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const data: CreateLabelData = req.body;

      if (!data.productId || !data.templateId || !data.labelType || !data.labelData) {
        res.status(400).json({
          error: 'productId, templateId, labelType, and labelData are required',
        });
        return;
      }

      const label = await this.labelService.create(data, req.user.id);

      res.status(201).json({
        message: 'Label created successfully',
        label,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update label
   * PUT /api/labels/:id
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { labelData, notes, pdfUrl } = req.body;

      const label = await this.labelService.update(
        id,
        { labelData, notes, pdfUrl },
        req.user.id
      );

      res.status(200).json({
        message: 'Label updated successfully',
        label,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update label status
   * PATCH /api/labels/:id/status
   */
  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      const label = await this.labelService.updateStatus(id, status, req.user.id);

      res.status(200).json({
        message: 'Label status updated successfully',
        label,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Approve label
   * POST /api/labels/:id/approve
   */
  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const label = await this.labelService.approve(id, req.user.id);

      res.status(200).json({
        message: 'Label approved successfully',
        label,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reject label
   * POST /api/labels/:id/reject
   */
  reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { reason } = req.body;

      const label = await this.labelService.reject(id, req.user.id, reason);

      res.status(200).json({
        message: 'Label rejected successfully',
        label,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete label
   * DELETE /api/labels/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      await this.labelService.delete(id, req.user);

      res.status(200).json({ message: 'Label deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get labels by product
   * GET /api/labels/product/:productId
   */
  getByProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;
      const labels = await this.labelService.getByProduct(productId);

      res.status(200).json({ labels });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get pending approvals
   * GET /api/labels/pending-approval
   */
  getPendingApproval = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const labels = await this.labelService.getPendingApproval();

      res.status(200).json({ labels });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's labels
   * GET /api/labels/my-labels
   */
  getMyLabels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const labels = await this.labelService.getUserLabels(req.user.id);

      res.status(200).json({ labels });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update label specifications
   * PUT /api/labels/:id/specifications
   */
  updateSpecifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const specs = req.body;

      const specification = await this.labelService.updateSpecifications(id, specs);

      res.status(200).json({
        message: 'Label specifications updated successfully',
        specification,
      });
    } catch (error) {
      next(error);
    }
  };
}
