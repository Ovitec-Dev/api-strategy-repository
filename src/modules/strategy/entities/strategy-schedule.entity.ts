import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Strategy } from './strategy.entity';

@Entity('strategy_schedules')
export class StrategySchedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Strategy)
    strategy: Strategy;

    @Column()
    cronExpression: string;

    @Column({ default: 'America/Argentina/Buenos_Aires' })
    timezone: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamp', nullable: true })
    nextRunAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastRunAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
