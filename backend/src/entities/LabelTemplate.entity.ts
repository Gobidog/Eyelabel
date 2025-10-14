import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TemplateType } from '../types/enums';
import { Label } from './Label.entity';

@Entity('label_templates')
export class LabelTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({
    type: 'enum',
    enum: TemplateType,
  })
  type!: TemplateType;

  @Column({ type: 'jsonb' })
  templateData!: {
    width: number;
    height: number;
    elements: Array<{
      type: string;
      x: number;
      y: number;
      width: number;
      height: number;
      properties: Record<string, any>;
    }>;
    styles?: Record<string, any>;
  };

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Label, (label) => label.template)
  labels!: Label[];
}
