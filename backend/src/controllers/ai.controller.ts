import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

export class AIController {
  /**
   * Extract specifications from product description text
   * POST /api/ai/extract-specs
   */
  extractSpecifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { text, product_type } = req.body;

      if (!text) {
        res.status(400).json({ error: 'Text is required' });
        return;
      }

      const response = await axios.post(`${AI_SERVICE_URL}/api/extract-specs`, {
        text,
        product_type,
      });

      res.status(200).json(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        next(error);
      }
    }
  };

  /**
   * Suggest appropriate template for product
   * POST /api/ai/suggest-template
   */
  suggestTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { product_type, product_name, description } = req.body;

      if (!product_type) {
        res.status(400).json({ error: 'Product type is required' });
        return;
      }

      const response = await axios.post(`${AI_SERVICE_URL}/api/suggest-template`, {
        product_type,
        product_name,
        description,
      });

      res.status(200).json(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        next(error);
      }
    }
  };

  /**
   * Generate label design variations
   * POST /api/ai/generate-design
   */
  generateDesign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        product_name,
        product_code,
        template_type,
        specifications,
        canvas_width,
        canvas_height,
        num_variations,
      } = req.body;

      if (!product_name || !product_code || !template_type || !specifications) {
        res.status(400).json({
          error: 'product_name, product_code, template_type, and specifications are required',
        });
        return;
      }

      const response = await axios.post(`${AI_SERVICE_URL}/api/generate-design`, {
        product_name,
        product_code,
        template_type,
        specifications,
        canvas_width: canvas_width || 800,
        canvas_height: canvas_height || 600,
        num_variations: num_variations || 3,
      });

      res.status(200).json(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        next(error);
      }
    }
  };

  /**
   * Check AI service health
   * GET /api/ai/health
   */
  health = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/health`);
      res.status(200).json(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.status(503).json({
          status: 'error',
          message: 'AI service is unavailable',
        });
      } else {
        next(error);
      }
    }
  };
}
