import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Email and password are required',
        });
        return;
      }

      const result = await this.authService.login({ email, password });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Register new user
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({
          error: 'Email, password, firstName, and lastName are required',
        });
        return;
      }

      const result = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current user profile
   * GET /api/auth/profile
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const profile = await this.authService.getProfile(req.user.id);

      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };
}
