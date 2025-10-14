import { Router } from 'express';
import { LabelController } from '../controllers/label.controller';
import { authenticate } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { AuditAction } from '../types/enums';

const router = Router();
const labelController = new LabelController();

router.use(authenticate);

/**
 * @route   GET /api/labels
 * @desc    Get all labels with pagination and filters
 * @access  Private
 */
router.get('/', labelController.getAll);

/**
 * @route   GET /api/labels/my-labels
 * @desc    Get current user's labels
 * @access  Private
 */
router.get('/my-labels', labelController.getMyLabels);

/**
 * @route   GET /api/labels/pending-approval
 * @desc    Get labels pending approval
 * @access  Private
 */
router.get('/pending-approval', labelController.getPendingApproval);

/**
 * @route   GET /api/labels/product/:productId
 * @desc    Get labels by product ID
 * @access  Private
 */
router.get('/product/:productId', labelController.getByProduct);

/**
 * @route   GET /api/labels/:id
 * @desc    Get label by ID
 * @access  Private
 */
router.get('/:id', labelController.getById);

/**
 * @route   POST /api/labels
 * @desc    Create new label
 * @access  Private
 */
router.post(
  '/',
  auditLog('label', AuditAction.CREATE),
  labelController.create
);

/**
 * @route   PUT /api/labels/:id
 * @desc    Update label
 * @access  Private
 */
router.put(
  '/:id',
  auditLog('label', AuditAction.UPDATE),
  labelController.update
);

/**
 * @route   PATCH /api/labels/:id/status
 * @desc    Update label status
 * @access  Private
 */
router.patch(
  '/:id/status',
  auditLog('label', AuditAction.UPDATE),
  labelController.updateStatus
);

/**
 * @route   POST /api/labels/:id/approve
 * @desc    Approve label
 * @access  Private
 */
router.post(
  '/:id/approve',
  auditLog('label', AuditAction.APPROVE),
  labelController.approve
);

/**
 * @route   POST /api/labels/:id/reject
 * @desc    Reject label (send back to design)
 * @access  Private
 */
router.post(
  '/:id/reject',
  auditLog('label', AuditAction.REJECT),
  labelController.reject
);

/**
 * @route   PUT /api/labels/:id/specifications
 * @desc    Update label specifications
 * @access  Private
 */
router.put(
  '/:id/specifications',
  auditLog('label', AuditAction.UPDATE),
  labelController.updateSpecifications
);

/**
 * @route   DELETE /api/labels/:id
 * @desc    Delete label (draft only)
 * @access  Private
 */
router.delete(
  '/:id',
  auditLog('label', AuditAction.DELETE),
  labelController.delete
);

export default router;
