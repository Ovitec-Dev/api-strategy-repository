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
import { Category } from '../../category/entities/category.entity';
import { SubCategory } from '../../category/entities/sub-category.entity';
import { Order } from '../../order/entities/order.entity';
import { CategoryType } from '../../category/entities/category.entity';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => Portfolio)
    portfolio: Portfolio;

    @ManyToOne(() => Category, { nullable: true })
    category: Category;

    @ManyToOne(() => SubCategory, { nullable: true })
    subCategory: SubCategory;

    @ManyToOne(() => Order, { nullable: true })
    order: Order;

    @Column({ type: 'enum', enum: CategoryType })
    type: string;

    @Column({ type: 'decimal', precision: 18, scale: 8 })
    amount: number;

    @Column()
    currency: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
