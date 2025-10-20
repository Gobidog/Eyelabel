import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { AuditAction } from '../types/enums';
import { upload } from '../config/multer';

const router = Router();
const productController = new ProductController();

router.use(authenticate);

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination
 * @access  Private (All authenticated users)
 */
router.get('/', productController.getAll);

/**
 * @route   GET /api/products/barcode/:barcode
 * @desc    Get product by GS1 barcode
 * @access  Private
 */
router.get('/barcode/:barcode', productController.getByBarcode);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Private
 */
router.get('/:id', productController.getById);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private
 */
router.post(
  '/',
  auditLog('product', AuditAction.CREATE),
  productController.create
);

/**
 * @route   POST /api/products/bulk
 * @desc    Bulk create products
 * @access  Private
 */
router.post(
  '/bulk',
  auditLog('product', AuditAction.CREATE),
  productController.bulkCreate
);

/**
 * @route   POST /api/products/import-csv
 * @desc    Import products from CSV with optional images
 * @access  Private
 */
router.post(
  '/import-csv',
  upload.fields([
    { name: 'csv', maxCount: 1 },
    { name: 'images', maxCount: 100 }
  ]),
  auditLog('product', AuditAction.CREATE),
  productController.importCSV
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private
 */
router.put(
  '/:id',
  auditLog('product', AuditAction.UPDATE),
  productController.update
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private
 */
router.delete(
  '/:id',
  auditLog('product', AuditAction.DELETE),
  productController.delete
);

export default router;
