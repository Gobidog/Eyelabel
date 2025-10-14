import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const aiController = new AIController();

// AI service health check (no auth required)
router.get('/health', aiController.health);

// Protected AI endpoints
router.post('/extract-specs', authMiddleware, aiController.extractSpecifications);
router.post('/suggest-template', authMiddleware, aiController.suggestTemplate);
router.post('/generate-design', authMiddleware, aiController.generateDesign);

export default router;
