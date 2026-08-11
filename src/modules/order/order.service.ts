import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
    ) { }

    async createOrder(userId: string, data: Partial<Order>): Promise<Order> {
        const order = this.orderRepo.create({
            ...data,
            user: { id: userId },
        });
        return this.orderRepo.save(order);
    }

    async getOrders(userId: string, filters: any): Promise<Order[]> {
        const query = this.orderRepo.createQueryBuilder('order')
            .leftJoinAndSelect('order.portfolio', 'portfolio')
            .where('order.user = :userId', { userId });

        if (filters.status) {
            query.andWhere('order.status = :status', { status: filters.status });
        }
        if (filters.portfolioId) {
            query.andWhere('order.portfolio = :portfolioId', { portfolioId: filters.portfolioId });
        }

        return query.orderBy('order.createdAt', 'DESC').getMany();
    }

    async getOrderById(userId: string, id: string): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id, user: { id: userId } },
            relations: ['portfolio'],
        });
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    async updateOrderStatus(userId: string, id: string, status: OrderStatus): Promise<Order> {
        const order = await this.getOrderById(userId, id);
        if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
            throw new Error(`Cannot transition from ${order.status}`);
        }
        order.status = status;
        if (status === OrderStatus.COMPLETED) {
            order.completedAt = new Date();
        }
        return this.orderRepo.save(order);
    }

    async deleteOrder(userId: string, id: string): Promise<void> {
        const order = await this.getOrderById(userId, id);
        order.status = OrderStatus.CANCELLED;
        await this.orderRepo.save(order);
    }
}
