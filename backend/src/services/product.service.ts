import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product.entity';
import { createError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export interface ProductFilters {
  search?: string;
  productCode?: string;
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

export class ProductService {
  private get repository(): Repository<Product> {
    if (!AppDataSource.isInitialized) {
      throw createError('Database connection not initialized', 500);
    }

    return AppDataSource.getRepository(Product);
  }

  /**
   * Get all products with pagination and filters
   */
  async getAll(filters: ProductFilters): Promise<PaginatedResult<Product>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Product> = {};

    // Apply search filter
    if (filters.search) {
      where.productName = ILike(`%${filters.search}%`);
    }

    if (filters.productCode) {
      where.productCode = filters.productCode;
    }

    const [data, total] = await this.repository.findAndCount({
      where,
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
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
   * Get product by ID
   */
  async getById(id: string): Promise<Product> {
    const product = await this.repository.findOne({
      where: { id },
      relations: ['labels'],
    });

    if (!product) {
      throw createError('Product not found', 404);
    }

    return product;
  }

  /**
   * Get product by GS1 barcode
   */
  async getByBarcode(barcode: string): Promise<Product> {
    const product = await this.repository.findOne({
      where: { gs1BarcodeNumber: barcode },
    });

    if (!product) {
      throw createError('Product not found', 404);
    }

    return product;
  }

  /**
   * Create new product
   */
  async create(data: {
    gs1BarcodeNumber: string;
    productCode: string;
    productName: string;
    description?: string;
    barcodeImageUrl?: string;
    datePrepared?: Date;
    cartonLabelInfo?: string;
    productLabelInfo?: string;
    remoteLabelRequired?: boolean;
    productImageUrl?: string;
    status?: string;
    metadata?: Record<string, any>;
  }): Promise<Product> {
    // Check if barcode already exists
    const existing = await this.repository.findOne({
      where: { gs1BarcodeNumber: data.gs1BarcodeNumber },
    });

    if (existing) {
      throw createError('Product with this barcode already exists', 409);
    }

    const product = this.repository.create(data);
    await this.repository.save(product);

    logger.info(`Product created: ${product.productName} (${product.productCode})`);

    return product;
  }

  /**
   * Update product
   */
  async update(
    id: string,
    data: {
      productCode?: string;
      productName?: string;
      description?: string;
      barcodeImageUrl?: string;
      datePrepared?: Date;
      cartonLabelInfo?: string;
      productLabelInfo?: string;
      remoteLabelRequired?: boolean;
      productImageUrl?: string;
      status?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<Product> {
    const product = await this.getById(id);

    Object.assign(product, data);
    await this.repository.save(product);

    logger.info(`Product updated: ${product.productName} (${product.productCode})`);

    return product;
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<void> {
    const product = await this.getById(id);

    // Check if product has labels
    if (product.labels && product.labels.length > 0) {
      throw createError('Cannot delete product with existing labels', 400);
    }

    await this.repository.remove(product);

    logger.info(`Product deleted: ${product.productName} (${product.productCode})`);
  }

  /**
   * Bulk create products
   */
  async bulkCreate(
    products: Array<{
      gs1BarcodeNumber: string;
      productCode: string;
      productName: string;
      description?: string;
      barcodeImageUrl?: string;
      datePrepared?: Date;
      cartonLabelInfo?: string;
      productLabelInfo?: string;
      remoteLabelRequired?: boolean;
      productImageUrl?: string;
      status?: string;
      metadata?: Record<string, any>;
    }>
  ): Promise<{ created: Product[]; errors: Array<{ index: number; error: string }> }> {
    const created: Product[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < products.length; i++) {
      try {
        const product = await this.create(products[i]);
        created.push(product);
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    logger.info(`Bulk create: ${created.length} products created, ${errors.length} errors`);

    return { created, errors };
  }
}
