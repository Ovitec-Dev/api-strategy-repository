import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Strategy } from './strategy.entity';

@Entity('validations')
export class Validation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    strategy_id: string;

    @Column({ type: 'boolean' })
    is_valid: boolean;

    @Column({ type: 'json' })
    validation_messages: object;

    @Column({ type: 'json', nullable: true })
    risk_assessment: object;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;

    // Relations
    @ManyToOne(() => Strategy)
    @JoinColumn({ name: 'strategy_id' })
    strategy: Strategy;
}
