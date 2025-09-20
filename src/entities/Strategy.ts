import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';
import { User } from './User';
import { StrategyRule } from './StrategyRule';
import { BacktestResult } from './BacktestResult';
import { EventLog } from './EventLog';

export enum StrategyStatus {
  PENDING = 'pending',
  PARSED = 'parsed',
  VALIDATED = 'validated',
  INVALID = 'invalid',
  TESTED = 'tested',
  FAILED = 'failed'
}

@Entity('strategies')
export class Strategy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: StrategyStatus,
    default: StrategyStatus.PENDING
  })
  status: StrategyStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.strategies)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => StrategyRule, strategyRule => strategyRule.strategy)
  strategy_rules: StrategyRule[];

  @OneToMany(() => BacktestResult, backtestResult => backtestResult.strategy)
  backtest_results: BacktestResult[];

  @OneToMany(() => EventLog, eventLog => eventLog.strategy)
  event_logs: EventLog[];
} 