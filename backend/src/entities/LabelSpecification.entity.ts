import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Label } from './Label.entity';

@Entity('label_specifications')
export class LabelSpecification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100, nullable: true })
  powerInput?: string;

  @Column({ length: 50, nullable: true })
  temperatureRating?: string;

  @Column({ length: 10, nullable: true })
  ipRating?: string;

  @Column({ length: 100, nullable: true })
  cctOptions?: string;

  @Column({ length: 100, nullable: true })
  powerOptions?: string;

  @Column({ length: 50, nullable: true })
  opticType?: string;

  @Column({ length: 50, nullable: true })
  classRating?: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalSpecs?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  // Relations
  @OneToOne(() => Label, (label) => label.specification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'labelId' })
  label!: Label;

  @Column()
  labelId!: string;
}
