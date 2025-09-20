import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { StrategyRule } from './StrategyRule';

@Entity('validations')
export class Validation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  strategy_rule_id: string;

  @Column({ type: 'boolean' })
  passed: boolean;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  validated_at: Date;

  // Relations
  @ManyToOne(() => StrategyRule, strategyRule => strategyRule.validations)
  @JoinColumn({ name: 'strategy_rule_id' })
  strategy_rule: StrategyRule;
} 