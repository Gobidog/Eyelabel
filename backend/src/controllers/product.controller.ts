import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Get all products
   * GET /api/products
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, productCode, page, limit } = req.query;

      const result = await this.productService.getAll({
        search: search as string,
        productCode: productCode as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.getById(id);

      res.status(200).json({ product });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get product by barcode
   * GET /api/products/barcode/:barcode
   */
  getByBarcode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { barcode } = req.params;
      const product = await this.productService.getByBarcode(barcode);

      res.status(200).json({ product });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new product
   * POST /api/products
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        gs1BarcodeNumber,
        productCode,
        productName,
        description,
        barcodeImageUrl,
        datePrepared,
        cartonLabelInfo,
        productLabelInfo,
        remoteLabelRequired,
        productImageUrl,
        status,
        metadata,
      } = req.body;

      if (!gs1BarcodeNumber || !productCode || !productName) {
        res.status(400).json({
          error: 'gs1BarcodeNumber, productCode, and productName are required',
        });
        return;
      }

      const product = await this.productService.create({
        gs1BarcodeNumber,
        productCode,
        productName,
        description,
        barcodeImageUrl,
        datePrepared,
        cartonLabelInfo,
        productLabelInfo,
        remoteLabelRequired,
        productImageUrl,
        status,
        metadata,
      });

      res.status(201).json({
        message: 'Product created successfully',
        product,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update product
   * PUT /api/products/:id
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        productCode,
        productName,
        description,
        barcodeImageUrl,
        datePrepared,
        cartonLabelInfo,
        productLabelInfo,
        remoteLabelRequired,
        productImageUrl,
        status,
        metadata,
      } = req.body;

      const product = await this.productService.update(id, {
        productCode,
        productName,
        description,
        barcodeImageUrl,
        datePrepared,
        cartonLabelInfo,
        productLabelInfo,
        remoteLabelRequired,
        productImageUrl,
        status,
        metadata,
      });

      res.status(200).json({
        message: 'Product updated successfully',
        product,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete product
   * DELETE /api/products/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.productService.delete(id);

      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk create products
   * POST /api/products/bulk
   */
  bulkCreate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { products } = req.body;

      if (!Array.isArray(products) || products.length === 0) {
        res.status(400).json({ error: 'Products array is required' });
        return;
      }

      const result = await this.productService.bulkCreate(products);

      res.status(201).json({
        message: `Bulk create completed: ${result.created.length} created, ${result.errors.length} errors`,
        created: result.created,
        errors: result.errors,
      });
    } catch (error) {
      next(error);
    }
  };
}
