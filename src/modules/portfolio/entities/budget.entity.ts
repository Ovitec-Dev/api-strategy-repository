import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Portfolio } from './portfolio.entity';

export enum BudgetPeriod {
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    ANNUAL = 'ANNUAL',
    CUSTOM = 'CUSTOM',
}

@Entity('budgets')
export class Budget {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Portfolio)
    portfolio: Portfolio;

    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 18, scale: 8 })
    amount: number;

    @Column()
    currency: string;

    @Column({ type: 'enum', enum: BudgetPeriod })
    period: string;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
