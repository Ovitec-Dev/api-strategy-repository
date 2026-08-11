import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Strategy } from './strategy.entity';
import { Rule } from './rule.entity';

@Entity('strategy_rules')
export class StrategyRule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    strategy_id: string;

    @Column({ type: 'uuid' })
    rule_id: string;

    @Column({ type: 'json', nullable: true })
    parameters: object;

    // Relations
    @ManyToOne(() => Strategy, strategy => strategy.strategy_rules)
    @JoinColumn({ name: 'strategy_id' })
    strategy: Strategy;

    @ManyToOne(() => Rule)
    @JoinColumn({ name: 'rule_id' })
    rule: Rule;
}
