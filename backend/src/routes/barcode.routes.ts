import { Router } from 'express';
import { BarcodeController } from '../controllers/barcode.controller';

const router = Router();
const barcodeController = new BarcodeController();

/**
 * @route POST /api/barcode/generate
 * @desc Generate barcode image
 * @access Public (no auth required for barcode generation)
 */
router.post('/generate', (req, res) => barcodeController.generate(req, res));

export default router;
