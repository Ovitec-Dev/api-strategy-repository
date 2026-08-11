import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Unique,
} from 'typeorm';
import { Strategy } from './strategy.entity';
import { StrategySchedule } from './strategy-schedule.entity';
import { Order } from '../../order/entities/order.entity';
import { OrderStatus } from '../../order/entities/order.entity';

@Entity('strategy_executions')
@Unique(['strategyId', 'month', 'year'])
export class StrategyExecution {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Strategy)
    strategy: Strategy;

    @Column()
    strategyId: string;

    @ManyToOne(() => StrategySchedule, { nullable: true })
    schedule: StrategySchedule;

    @ManyToOne(() => Order, { nullable: true })
    order: Order;

    @Column({ type: 'varchar', nullable: true })
    orderId: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: string;

    @Column({ type: 'smallint' })
    month: number;

    @Column({ type: 'smallint' })
    year: number;

    @Column({ type: 'timestamp', nullable: true })
    startedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    finishedAt: Date;

    @Column({ nullable: true, type: 'text' })
    errorMessage: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;
}
