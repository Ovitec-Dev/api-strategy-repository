import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { Strategy } from './Strategy';
import { Rule } from './Rule';
import { Validation } from './Validation';

@Entity('strategy_rules')
export class StrategyRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  strategy_id: string;

  @Column({ type: 'uuid' })
  rule_id: string;

  @Column({ type: 'json' })
  parameters: object;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assigned_at: Date;

  // Relations
  @ManyToOne(() => Strategy, strategy => strategy.strategy_rules)
  @JoinColumn({ name: 'strategy_id' })
  strategy: Strategy;

  @ManyToOne(() => Rule, rule => rule.strategy_rules)
  @JoinColumn({ name: 'rule_id' })
  rule: Rule;

  @OneToMany(() => Validation, validation => validation.strategy_rule)
  validations: Validation[];
} 