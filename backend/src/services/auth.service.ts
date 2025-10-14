import { UserService } from './user.service';
import { generateToken, comparePassword, JWTPayload } from '../utils/jwt';
import { createError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { UserRole } from '../entities/User.entity';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export class AuthService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Get user with password
    const user = await this.userService.getByEmail(email, true);

    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw createError('Account is disabled', 403);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Update last login
    await this.userService.updateLastLogin(user.id);

    // Generate token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(payload);

    logger.info(`User logged in: ${user.email}`);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw createError('Invalid email format', 400);
    }

    // Validate password strength
    if (data.password.length < 6) {
      throw createError('Password must be at least 6 characters long', 400);
    }

    // Create user
    const user = await this.userService.create({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRole.ENGINEER, // Default role
    });

    // Generate token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(payload);

    logger.info(`New user registered: ${user.email}`);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await this.userService.getById(userId);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
