import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { AuditLog } from '../entities/AuditLog.entity';
import { AuditAction } from '../types/enums';
import { logger } from '../utils/logger';

/**
 * Middleware to log actions to audit log
 */
export const auditLog = (entityType: string, action: AuditAction) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to capture response
    res.json = function (data: any) {
      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Create audit log entry asynchronously (don't wait)
        createAuditLog(req, entityType, action, data).catch((error) => {
          logger.error('Failed to create audit log:', error);
        });
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Create audit log entry
 */
async function createAuditLog(
  req: Request,
  entityType: string,
  action: AuditAction,
  responseData: any
): Promise<void> {
  try {
    if (!req.user) return; // Only log authenticated actions

    const auditLogRepository = AppDataSource.getRepository(AuditLog);

    // Extract entity ID from response (check nested structures) or params
    const entityId =
      responseData?.id ||           // Direct ID in response
      responseData?.entity?.id ||   // Nested in entity object
      responseData?.label?.id ||    // Nested in label object
      responseData?.product?.id ||  // Nested in product object
      responseData?.template?.id || // Nested in template object
      req.params.id;                // From URL params

    // Skip audit logging if no valid entity ID found
    if (!entityId) {
      logger.warn(`Audit log skipped: No entity ID found for ${entityType} ${action}`);
      return;
    }

    // Capture changes for update actions
    let changes: any = undefined;
    if (action === AuditAction.UPDATE && req.body) {
      changes = {
        after: req.body,
      };
    }

    const auditLog = auditLogRepository.create({
      entityType,
      entityId,
      action,
      userId: req.user.id,
      changes,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    });

    await auditLogRepository.save(auditLog);

    logger.info(`Audit log created: ${entityType} ${action} by ${req.user.email}`);
  } catch (error) {
    logger.error('Audit log creation failed:', error);
    // Don't throw - audit logging should not break the request
  }
}

/**
 * Middleware to log all changes for specific routes
 */
export const auditAll = (req: Request, res: Response, next: NextFunction): void => {
  const method = req.method;
  let action: AuditAction | null = null;

  switch (method) {
    case 'POST':
      action = AuditAction.CREATE;
      break;
    case 'PUT':
    case 'PATCH':
      action = AuditAction.UPDATE;
      break;
    case 'DELETE':
      action = AuditAction.DELETE;
      break;
  }

  if (action) {
    const entityType = req.path.split('/')[2] || 'unknown'; // Extract from /api/products => products
    auditLog(entityType, action)(req, res, next);
  } else {
    next();
  }
};
