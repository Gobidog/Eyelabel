import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditAction } from '../types/enums';
import { User } from './User.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 50 })
  entityType!: string;

  @Column('uuid')
  entityId!: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action!: AuditAction;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @ManyToOne(() => User, (user) => user.auditLogs)
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'jsonb', nullable: true })
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  timestamp!: Date;
}
