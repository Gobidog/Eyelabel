import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Label } from './Label.entity';
import { AuditLog } from './AuditLog.entity';

export enum UserRole {
  ENGINEER = 'engineer',
  DESIGNER = 'designer',
  APPROVER = 'approver',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ENGINEER,
  })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  // Relations
  @OneToMany(() => Label, (label) => label.createdBy)
  createdLabels?: Label[];

  @OneToMany(() => Label, (label) => label.approvedBy)
  approvedLabels?: Label[];

  @OneToMany(() => AuditLog, (audit) => audit.user)
  auditLogs?: AuditLog[];
}
