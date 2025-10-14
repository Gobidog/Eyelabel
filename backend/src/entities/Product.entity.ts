import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Label } from './Label.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 20 })
  gs1BarcodeNumber!: string;

  @Column({ length: 20 })
  productCode!: string;

  @Column({ length: 200 })
  productName!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  barcodeImageUrl?: string;

  @Column({ type: 'date', nullable: true })
  datePrepared?: Date;

  @Column({ type: 'text', nullable: true })
  cartonLabelInfo?: string;

  @Column({ type: 'text', nullable: true })
  productLabelInfo?: string;

  @Column({ type: 'boolean', default: false })
  remoteLabelRequired!: boolean;

  @Column({ type: 'text', nullable: true })
  productImageUrl?: string;

  @Column({ length: 20, default: 'Active' })
  status!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Label, (label) => label.product)
  labels!: Label[];
}
