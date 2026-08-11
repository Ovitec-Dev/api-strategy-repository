import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Portfolio } from '../../portfolio/entities/portfolio.entity';

export enum CategoryType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
    TRANSFER = 'TRANSFER',
}

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { nullable: true })
    user: User; // Null indicates it is a system-wide category

    @ManyToOne(() => Portfolio, { nullable: true })
    portfolio: Portfolio;

    @Column()
    name: string;

    @Column({ type: 'enum', enum: CategoryType })
    type: string;

    @Column({ type: 'varchar', nullable: true })
    color: string;

    @Column({ type: 'varchar', nullable: true })
    icon: string;

    @Column({ default: false })
    isSystem: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
