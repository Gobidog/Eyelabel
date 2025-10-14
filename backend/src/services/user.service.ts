import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User.entity';
import { hashPassword } from '../utils/jwt';
import { createError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export class UserService {
  private get repository(): Repository<User> {
    if (!AppDataSource.isInitialized) {
      throw createError('Database connection not initialized', 500);
    }

    return AppDataSource.getRepository(User);
  }

  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    return this.repository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'lastLoginAt'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    const user = await this.repository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'lastLoginAt'],
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    return user;
  }

  /**
   * Get user by email (includes password for authentication)
   */
  async getByEmail(email: string, includePassword = false): Promise<User | null> {
    const query = this.repository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (includePassword) {
      query.addSelect('user.password');
    }

    return query.getOne();
  }

  /**
   * Create new user
   */
  async create(data: CreateUserData): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getByEmail(data.email);
    if (existingUser) {
      throw createError('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = this.repository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || UserRole.ENGINEER,
      isActive: true,
    });

    await this.repository.save(user);

    logger.info(`User created: ${user.email} (${user.role})`);

    // Return user without password
    return this.getById(user.id);
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.repository.findOne({ where: { id } });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Update fields
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.role !== undefined) user.role = data.role;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    await this.repository.save(user);

    logger.info(`User updated: ${user.email}`);

    return this.getById(id);
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    const user = await this.getById(id);

    await this.repository.remove(user);

    logger.info(`User deleted: ${user.email}`);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.repository.update(id, {
      lastLoginAt: new Date(),
    });
  }
}
