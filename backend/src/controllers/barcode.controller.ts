import { Request, Response } from 'express';
import bwipjs from 'bwip-js';

export class BarcodeController {
  /**
   * Generate barcode image
   * POST /api/barcode/generate
   */
  async generate(req: Request, res: Response): Promise<void> {
    try {
      const { text, format = 'ean13', height = 50, width = 2 } = req.body;

      if (!text) {
        res.status(400).json({ message: 'Barcode text is required' });
        return;
      }

      // Validate format
      const validFormats = ['ean13', 'code128', 'gs1-128', 'qrcode'];
      if (!validFormats.includes(format)) {
        res.status(400).json({
          message: `Invalid barcode format. Must be one of: ${validFormats.join(', ')}`
        });
        return;
      }

      // Generate barcode as PNG buffer
      const png = await bwipjs.toBuffer({
        bcid: format, // Barcode type
        text: text, // Text to encode
        scale: 3, // 3x scale for better quality
        height: height, // Bar height in millimeters
        width: width, // Bar width multiplier
        includetext: true, // Show human-readable text
        textxalign: 'center', // Center align text
      });

      // Convert to base64 data URL
      const dataUrl = `data:image/png;base64,${png.toString('base64')}`;

      res.json({
        success: true,
        dataUrl,
        format,
        text,
      });
    } catch (error: any) {
      console.error('Barcode generation error:', error);
      res.status(500).json({
        message: 'Failed to generate barcode',
        error: error.message,
      });
    }
  }
}
