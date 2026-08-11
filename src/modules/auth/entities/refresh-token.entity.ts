import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    user: User;

    @Column({ unique: true })
    token: string;

    @Column()
    expiresAt: Date;

    @Column({ nullable: true })
    revokedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
