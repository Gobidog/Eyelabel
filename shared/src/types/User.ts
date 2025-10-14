/**
 * User role enumeration
 */
export enum UserRole {
  ADMIN = 'admin',
  ENGINEER = 'engineer',
  DESIGNER = 'designer',
  APPROVER = 'approver',
}

/**
 * User entity interface
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

/**
 * User creation DTO
 */
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

/**
 * User update DTO
 */
export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}
