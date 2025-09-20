import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { Grade } from './Grade';
import { StrategyRule } from './StrategyRule';

@Entity('rules')
export class Rule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json' })
  parameters_schema: object;

  @Column({ type: 'int' })
  grade_id: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // Relations
  @ManyToOne(() => Grade, grade => grade.rules)
  @JoinColumn({ name: 'grade_id' })
  grade: Grade;

  @OneToMany(() => StrategyRule, strategyRule => strategyRule.rule)
  strategy_rules: StrategyRule[];
} 