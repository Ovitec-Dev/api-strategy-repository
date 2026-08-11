import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Category } from './category.entity';
import { Portfolio } from '../../portfolio/entities/portfolio.entity';

@Entity('sub_categories')
export class SubCategory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Category)
    category: Category;

    @ManyToOne(() => Portfolio, { nullable: true })
    portfolio: Portfolio;

    @Column()
    name: string;

    @CreateDateColumn()
    createdAt: Date;
}
