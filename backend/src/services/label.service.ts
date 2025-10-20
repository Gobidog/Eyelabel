import { Repository, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Label } from '../entities/Label.entity';
import { LabelSpecification } from '../entities/LabelSpecification.entity';
import { Product } from '../entities/Product.entity';
import { LabelTemplate } from '../entities/LabelTemplate.entity';
import { User, UserRole } from '../entities/User.entity';
import { createError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { LabelStatus, LabelType } from '../types/enums';

export interface LabelFilters {
  status?: LabelStatus;
  labelType?: LabelType;
  productId?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export class LabelService {
  private get labelRepository(): Repository<Label> {
    if (!AppDataSource.isInitialized) {
      throw createError('Database connection not initialized', 500);
    }

    return AppDataSource.getRepository(Label);
  }

  private get specificationRepository(): Repository<LabelSpecification> {
    if (!AppDataSource.isInitialized) {
      throw createError('Database connection not initialized', 500);
    }

    return AppDataSource.getRepository(LabelSpecification);
  }

  /**
   * Get all labels with pagination and filters
   */
  async getAll(filters: LabelFilters): Promise<PaginatedResult<Label>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Label> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.labelType) {
      where.labelType = filters.labelType;
    }

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.createdBy) {
      where.createdById = filters.createdBy;
    }

    const [data, total] = await this.labelRepository.findAndCount({
      where,
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
      relations: ['product', 'template', 'specification'],
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get label by ID
   */
  async getById(id: string): Promise<Label> {
    const label = await this.labelRepository.findOne({
      where: { id },
      relations: ['product', 'template', 'specification', 'createdBy', 'approvedBy'],
    });

    if (!label) {
      throw createError('Label not found', 404);
    }

    return label;
  }

  /**
   * Create new label with transaction boundary
   */
  async create(data: CreateLabelData, userId: string): Promise<Label> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify product exists
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: data.productId },
      });

      if (!product) {
        throw createError('Product not found', 404);
      }

      // Verify template exists
      const template = await queryRunner.manager.findOne(LabelTemplate, {
        where: { id: data.templateId },
      });

      if (!template) {
        throw createError('Template not found', 404);
      }

      // Create label
      const label = queryRunner.manager.create(Label, {
        productId: data.productId,
        templateId: data.templateId,
        labelType: data.labelType,
        labelData: data.labelData,
        notes: data.notes,
        status: LabelStatus.DRAFT,
        createdById: userId,
      });

      await queryRunner.manager.save(label);

      // Create specifications if provided
      if (data.specifications) {
        const specification = queryRunner.manager.create(LabelSpecification, {
          labelId: label.id,
          ...data.specifications,
        });

        await queryRunner.manager.save(specification);
      }

      // Commit transaction - all operations succeeded
      await queryRunner.commitTransaction();

      logger.info(`Label created: ${label.id} for product ${product.productName}`);

      // Reload with relations
      return this.getById(label.id);

    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      logger.error(`Label creation failed, rolled back: ${error}`);
      throw error;
    } finally {
      // Always release connection
      await queryRunner.release();
    }
  }

  /**
   * Update label with transaction boundary
   */
  async update(
    id: string,
    data: {
      labelData?: {
        design: Record<string, any>;
        fields: Record<string, string>;
        customizations?: Record<string, any>;
      };
      notes?: string;
      pdfUrl?: string;
    },
    userId: string
  ): Promise<Label> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const label = await queryRunner.manager.findOne(Label, {
        where: { id },
        relations: ['product', 'template', 'specification', 'createdBy', 'approvedBy'],
      });

      if (!label) {
        throw createError('Label not found', 404);
      }

      // Check if label can be edited
      if ([LabelStatus.APPROVED, LabelStatus.SENT].includes(label.status)) {
        throw createError('Cannot edit approved or sent labels', 400);
      }

      // Update label fields
      if (data.labelData) {
        label.labelData = data.labelData;
      }

      if (data.notes !== undefined) {
        label.notes = data.notes;
      }

      if (data.pdfUrl) {
        label.pdfUrl = data.pdfUrl;
      }

      await queryRunner.manager.save(label);

      // Commit transaction
      await queryRunner.commitTransaction();

      logger.info(`Label updated: ${label.id} by user ${userId}`);

      return this.getById(id);

    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      logger.error(`Label update failed, rolled back: ${error}`);
      throw error;
    } finally {
      // Always release connection
      await queryRunner.release();
    }
  }

  /**
   * Update label status
   */
  async updateStatus(id: string, status: LabelStatus, userId: string): Promise<Label> {
    const label = await this.getById(id);

    // Validate status transitions
    const validTransitions: Record<LabelStatus, LabelStatus[]> = {
      [LabelStatus.DRAFT]: [LabelStatus.IN_DESIGN],
      [LabelStatus.IN_DESIGN]: [LabelStatus.REVIEW, LabelStatus.DRAFT],
      [LabelStatus.REVIEW]: [LabelStatus.APPROVED, LabelStatus.IN_DESIGN],
      [LabelStatus.APPROVED]: [LabelStatus.SENT],
      [LabelStatus.SENT]: [], // Cannot transition from SENT
    };

    if (!validTransitions[label.status].includes(status)) {
      throw createError(
        `Invalid status transition from ${label.status} to ${status}`,
        400
      );
    }

    label.status = status;

    // Set approval timestamp and user if approving
    if (status === LabelStatus.APPROVED) {
      label.approvedAt = new Date();
      label.approvedById = userId;
    }

    await this.labelRepository.save(label);

    logger.info(`Label status updated: ${label.id} -> ${status} by user ${userId}`);

    return this.getById(id);
  }

  /**
   * Approve label
   */
  async approve(id: string, userId: string): Promise<Label> {
    return this.updateStatus(id, LabelStatus.APPROVED, userId);
  }

  /**
   * Reject label (send back to design)
   */
  async reject(id: string, userId: string, reason?: string): Promise<Label> {
    const label = await this.getById(id);

    if (label.status !== LabelStatus.REVIEW) {
      throw createError('Only labels in review can be rejected', 400);
    }

    // Add rejection reason to notes
    if (reason) {
      label.notes = `${label.notes || ''}\n\nRejection reason: ${reason}`;
    }

    label.status = LabelStatus.IN_DESIGN;
    await this.labelRepository.save(label);

    logger.info(`Label rejected: ${label.id} by user ${userId}`);

    return this.getById(id);
  }

  /**
   * Delete label
   */
  async delete(id: string, user: User): Promise<void> {
    const label = await this.getById(id);

    // Admin can delete labels in any status
    // Non-admin users can only delete draft labels
    if (user.role !== UserRole.ADMIN && label.status !== LabelStatus.DRAFT) {
      throw createError('Only draft labels can be deleted', 400);
    }

    await this.labelRepository.remove(label);

    logger.info(
      `Label deleted: ${id} by user ${user.id} (${user.role === UserRole.ADMIN ? 'Admin override' : 'Draft deletion'})`
    );
  }

  /**
   * Get labels by product
   */
  async getByProduct(productId: string): Promise<Label[]> {
    return this.labelRepository.find({
      where: { productId },
      relations: ['template', 'specification'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get labels pending approval
   */
  async getPendingApproval(): Promise<Label[]> {
    return this.labelRepository.find({
      where: { status: LabelStatus.REVIEW },
      relations: ['product', 'template', 'createdBy'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get user's labels
   */
  async getUserLabels(userId: string): Promise<Label[]> {
    return this.labelRepository.find({
      where: { createdById: userId },
      relations: ['product', 'template'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update label specifications
   */
  async updateSpecifications(
    labelId: string,
    specs: {
      powerInput?: string;
      temperatureRating?: string;
      ipRating?: string;
      cctOptions?: string;
      powerOptions?: string;
      opticType?: string;
      classRating?: string;
      additionalSpecs?: Record<string, any>;
    }
  ): Promise<LabelSpecification> {
    const label = await this.getById(labelId);

    if (!label.specification) {
      // Create new specification
      const specification = this.specificationRepository.create({
        labelId,
        ...specs,
      });
      await this.specificationRepository.save(specification);
      return specification;
    }

    // Update existing specification
    Object.assign(label.specification, specs);
    await this.specificationRepository.save(label.specification);

    return label.specification;
  }
}
