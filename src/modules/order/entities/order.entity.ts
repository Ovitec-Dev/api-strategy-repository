import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Portfolio } from '../../portfolio/entities/portfolio.entity';
import { Strategy } from '../../strategy/entities/strategy.entity';

export enum OrderType {
    BUY = 'BUY',
    SELL = 'SELL',
    TRANSFER = 'TRANSFER',
    CUSTOM = 'CUSTOM',
}

export enum OrderStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => Portfolio, { nullable: true })
    portfolio: Portfolio;

    @ManyToOne(() => Strategy, { nullable: true })
    strategy: Strategy;

    @Column({ type: 'varchar', nullable: true })
    externalRef: string;

    @Column({ type: 'enum', enum: OrderType })
    type: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: string;

    @Column({ type: 'varchar', nullable: true })
    asset: string;

    @Column({ type: 'decimal', precision: 18, scale: 8 })
    amount: number;

    @Column()
    currency: string;

    @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
    executedAmount: number;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;
}
