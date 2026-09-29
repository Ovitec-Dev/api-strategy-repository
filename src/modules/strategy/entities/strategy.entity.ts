import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Portfolio } from '../../portfolio/entities/portfolio.entity';
import { StrategySchedule } from './strategy-schedule.entity';
import { StrategyExecution } from './strategy-execution.entity';
import { StrategyRule } from './strategy-rule.entity';
import { BacktestResult } from './backtest-result.entity';
import { EventLog } from './event-log.entity';

export enum StrategyType {
    MANUAL = 'MANUAL',
    SCHEDULED = 'SCHEDULED',
    EVENT_DRIVEN = 'EVENT_DRIVEN',
}

export enum StrategyStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ARCHIVED = 'ARCHIVED',
    PENDING = 'PENDING',
    PARSED = 'PARSED',
    VALIDATED = 'VALIDATED',
    INVALID = 'INVALID',
    TESTED = 'TESTED',
    FAILED = 'FAILED',
    EVALUATED = 'EVALUATED',
    SKIPPED = 'SKIPPED'
}

@Entity('strategies')
export class Strategy {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'portfolio_id', nullable: true })
    portfolio_id: string;

    @ManyToOne(() => Portfolio, { nullable: true })
    @JoinColumn({ name: 'portfolio_id' })
    portfolio: Portfolio;

    @Column()
    name: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ type: 'enum', enum: StrategyType, default: StrategyType.MANUAL })
    type: string;

    @Column({
        type: 'enum',
        enum: StrategyStatus,
        default: StrategyStatus.INACTIVE,
    })
    status: string;

    @Column({ type: 'jsonb', nullable: true })
    config: Record<string, any>;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @OneToMany(() => StrategySchedule, schedule => schedule.strategy)
    schedules: StrategySchedule[];

    @OneToMany(() => StrategyExecution, execution => execution.strategy)
    executions: StrategyExecution[];

    @OneToMany(() => StrategyRule, strategyRule => strategyRule.strategy)
    strategy_rules: StrategyRule[];

    @OneToMany(() => BacktestResult, backtestResult => backtestResult.strategy)
    backtest_results: BacktestResult[];

    @OneToMany(() => EventLog, eventLog => eventLog.strategy)
    event_logs: EventLog[];
}
