import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { parse } from 'csv-parse/sync';
import path from 'path';

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

  /**
   * Import products from CSV with optional image uploads
   * POST /api/products/import-csv
   */
  importCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      if (!files || !files['csv'] || files['csv'].length === 0) {
        res.status(400).json({ error: 'CSV file is required' });
        return;
      }

      const csvFile = files['csv'][0];
      const imageFiles = files['images'] || [];

      // Parse CSV
      let csvContent = csvFile.buffer ? csvFile.buffer.toString('utf-8') :
                         require('fs').readFileSync(csvFile.path, 'utf-8');

      // Remove BOM if present
      if (csvContent.charCodeAt(0) === 0xFEFF) {
        csvContent = csvContent.slice(1);
      }

      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });

      if (!Array.isArray(records) || records.length === 0) {
        res.status(400).json({ error: 'CSV file is empty or invalid' });
        return;
      }

      // Create a map of product codes to image paths
      const imageMap: Record<string, string> = {};
      imageFiles.forEach((file: Express.Multer.File) => {
        // Extract product code from filename (e.g., "PROD123.jpg" -> "PROD123")
        const productCode = path.basename(file.filename, path.extname(file.filename))
          .split('-')[0]; // Remove timestamp suffix if present
        imageMap[productCode] = `/uploads/products/${file.filename}`;
      });

      // Map CSV records to product data
      const products = records.map((record: any) => {
        const productCode = record['Product Code'] || record['productCode'] || '';
        const productName = record['Description'] || record['Product Name'] || record['productName'] || '';
        const gs1BarcodeNumber = record['GS1 Barcode Number'] || record['gs1BarcodeNumber'] ||
                                  record['Barcode'] || record['barcode'] || '';

        return {
          gs1BarcodeNumber,
          productCode,
          productName,
          description: record['Description'] || record['description'] || productName,
          productImageUrl: imageMap[productCode] || undefined,
          datePrepared: record['Date Prepared'] || record['datePrepared'] || undefined,
          cartonLabelInfo: record['Carton Label Info'] || record['cartonLabelInfo'] || undefined,
          productLabelInfo: record['Product Label Info'] || record['productLabelInfo'] || undefined,
          remoteLabelRequired: record['Remote Label Required'] === 'true' ||
                              record['remoteLabelRequired'] === 'true' || false,
          status: record['Status'] || record['status'] || 'Active',
        };
      });

      // Use existing bulkCreate service
      const result = await this.productService.bulkCreate(products);

      res.status(201).json({
        message: `CSV import completed: ${result.created.length} products created, ${result.errors.length} errors`,
        created: result.created,
        errors: result.errors,
        summary: {
          total: records.length,
          successful: result.created.length,
          failed: result.errors.length,
          imagesUploaded: imageFiles.length,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
