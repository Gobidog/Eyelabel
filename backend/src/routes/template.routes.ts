import { Router } from 'express';
import { templateController } from '../controllers/template.controller';
import { authenticate } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { AuditAction } from '../types/enums';

const router = Router();

router.use(authenticate);

/**
 * @route   GET /api/templates
 * @desc    Get all templates (paginated)
 * @access  Private
 */
router.get('/', templateController.getAll);

/**
 * @route   GET /api/templates/active
 * @desc    Get all active templates
 * @access  Private
 */
router.get('/active', templateController.getActive);

/**
 * @route   GET /api/templates/type/:type
 * @desc    Get templates by type
 * @access  Private
 */
router.get('/type/:type', templateController.getByType);

/**
 * @route   GET /api/templates/:id
 * @desc    Get template by ID
 * @access  Private
 */
router.get('/:id', templateController.getById);

/**
 * @route   POST /api/templates
 * @desc    Create new template
 * @access  Private
 */
router.post(
  '/',
  auditLog('template', AuditAction.CREATE),
  templateController.create
);

/**
 * @route   PUT /api/templates/:id
 * @desc    Update template
 * @access  Private
 */
router.put(
  '/:id',
  auditLog('template', AuditAction.UPDATE),
  templateController.update
);

/**
 * @route   PATCH /api/templates/:id/toggle-active
 * @desc    Toggle template active status
 * @access  Private
 */
router.patch(
  '/:id/toggle-active',
  auditLog('template', AuditAction.UPDATE),
  templateController.toggleActive
);

/**
 * @route   DELETE /api/templates/:id
 * @desc    Delete template
 * @access  Private
 */
router.delete(
  '/:id',
  auditLog('template', AuditAction.DELETE),
  templateController.delete
);

export default router;
