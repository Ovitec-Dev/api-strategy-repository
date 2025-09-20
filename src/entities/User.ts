import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { Strategy } from './Strategy';
import { BacktestResult } from './BacktestResult';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Relations
  @OneToMany(() => Strategy, strategy => strategy.user)
  strategies: Strategy[];

  @OneToMany(() => BacktestResult, backtestResult => backtestResult.user)
  backtest_results: BacktestResult[];
} 