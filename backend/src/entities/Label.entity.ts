import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { LabelType, LabelStatus } from '../types/enums';
import { Product } from './Product.entity';
import { LabelTemplate } from './LabelTemplate.entity';
import { LabelSpecification } from './LabelSpecification.entity';
import { User } from './User.entity';

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: LabelType,
  })
  labelType!: LabelType;

  @Column({
    type: 'enum',
    enum: LabelStatus,
    default: LabelStatus.DRAFT,
  })
  status!: LabelStatus;

  @Column({ type: 'jsonb' })
  labelData!: {
    design: Record<string, any>;
    fields: Record<string, string>;
    customizations?: Record<string, any>;
  };

  @Column({ type: 'text', nullable: true })
  pdfUrl?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  // Relations
  @ManyToOne(() => Product, (product) => product.labels, { eager: true })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column()
  productId!: string;

  @ManyToOne(() => LabelTemplate, (template) => template.labels, { eager: true })
  @JoinColumn({ name: 'templateId' })
  template!: LabelTemplate;

  @Column({ nullable: true })
  templateId?: string;

  @OneToOne(() => LabelSpecification, (spec) => spec.label, { cascade: true })
  specification!: LabelSpecification;

  @ManyToOne(() => User, (user) => user.createdLabels)
  @JoinColumn({ name: 'createdById' })
  createdBy?: User;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string;

  @ManyToOne(() => User, (user) => user.approvedLabels)
  @JoinColumn({ name: 'approvedById' })
  approvedBy?: User;

  @Column({ type: 'uuid', nullable: true })
  approvedById?: string;
}
