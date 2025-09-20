import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Strategy } from './Strategy';

@Entity('event_logs')
export class EventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  strategy_id: string;

  @Column({ type: 'varchar', length: 100 })
  event_type: string;

  @Column({ type: 'json' })
  payload: object;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  // Relations
  @ManyToOne(() => Strategy, strategy => strategy.event_logs)
  @JoinColumn({ name: 'strategy_id' })
  strategy: Strategy;
} 