import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { verifyToken, extractToken } from '../utils/jwt';
import { createError } from './error.middleware';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractToken(req.headers.authorization);

    if (!token) {
      throw createError('No token provided', 401);
    }

    // Verify token and get payload
    const payload = verifyToken(token);

    // Fetch user from database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: payload.userId },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'lastLoginAt'],
    });

    if (!user) {
      throw createError('User not found', 401);
    }

    if (!user.isActive) {
      throw createError('User account is disabled', 403);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
};

/**
 * Optional authentication middleware
 * Attaches user if authenticated, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req.headers.authorization);

    if (token) {
      const payload = verifyToken(token);
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: payload.userId },
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'lastLoginAt'],
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without user
    next();
  }
};

/**
 * Authorization middleware factory
 * Checks if authenticated user has required role(s)
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

// Alias for AI routes compatibility
export const authMiddleware = authenticate;
