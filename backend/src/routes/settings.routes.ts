import { Router } from 'express';
import settingsController from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../entities/User.entity';

const router = Router();

// All settings routes require admin authentication
router.use(authenticate, authorize(UserRole.ADMIN));

/**
 * @route   GET /api/settings
 * @desc    Get all settings (admin only)
 * @access  Private/Admin
 */
router.get('/', settingsController.getAllSettings.bind(settingsController));

/**
 * @route   GET /api/settings/openai/status
 * @desc    Get OpenAI API key status (masked)
 * @access  Private/Admin
 */
router.get(
  '/openai/status',
  settingsController.getOpenAIKeyStatus.bind(settingsController)
);

/**
 * @route   POST /api/settings/openai/key
 * @desc    Update OpenAI API key
 * @access  Private/Admin
 */
router.post(
  '/openai/key',
  settingsController.updateOpenAIKey.bind(settingsController)
);

/**
 * @route   POST /api/settings/openai/test
 * @desc    Test AI service connection
 * @access  Private/Admin
 */
router.post(
  '/openai/test',
  settingsController.testAIConnection.bind(settingsController)
);

/**
 * @route   DELETE /api/settings/:key
 * @desc    Delete setting by key
 * @access  Private/Admin
 */
router.delete('/:key', settingsController.deleteSetting.bind(settingsController));

export default router;
