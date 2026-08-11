import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Strategy } from './strategy.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('backtest_results')
export class BacktestResult {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    strategy_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'json' })
    performance_metrics: object;

    @Column({ type: 'json' })
    trade_log: object;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    tested_at: Date;

    // Relations
    @ManyToOne(() => Strategy, strategy => strategy.backtest_results)
    @JoinColumn({ name: 'strategy_id' })
    strategy: Strategy;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
