import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Order } from '@modules/order/entities/order.entity';
import { Strategy } from '@modules/strategy/entities/strategy.entity';
import { StrategyExecution } from '@modules/strategy/entities/strategy-execution.entity';

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL',
}

@Entity('operation_logs')
export class OperationLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, { nullable: true })
    order: Order;

    @Column({ type: 'uuid', nullable: true })
    orderId: string;

    @ManyToOne(() => Strategy, { nullable: true })
    strategy: Strategy;

    @Column({ type: 'uuid', nullable: true })
    strategyId: string;

    @ManyToOne(() => StrategyExecution, { nullable: true })
    execution: StrategyExecution;

    @Column({ type: 'uuid', nullable: true })
    executionId: string;

    @Column({ type: 'enum', enum: LogLevel })
    level: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'varchar', nullable: true })
    context: string; // Module or service name

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn({ type: 'timestamp' })
    timestamp: Date;
}
