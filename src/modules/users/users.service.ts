import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async getProfile(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
        const user = await this.getProfile(userId);

        if (updateData.name) user.name = updateData.name;
        if (updateData.avatar) user.avatar = updateData.avatar;

        return this.userRepository.save(user);
    }

    async softDelete(userId: string): Promise<void> {
        const user = await this.getProfile(userId);
        user.isActive = false;
        await this.userRepository.save(user);
    }

    // Admin methods
    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findOne(id: string): Promise<User> {
        return this.getProfile(id);
    }

    async changeRole(id: string, role: UserRole): Promise<User> {
        const user = await this.getProfile(id);
        user.role = role;
        return this.userRepository.save(user);
    }
}
