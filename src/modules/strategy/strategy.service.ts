import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Strategy, StrategyStatus, StrategyType } from './entities/strategy.entity';
import { StrategySchedule } from './entities/strategy-schedule.entity';
import { StrategyExecution } from './entities/strategy-execution.entity';
import { Order, OrderStatus, OrderType } from '@modules/order/entities/order.entity';
import { MessageBrokerService } from '@shared/messaging/messaging.service';

@Injectable()
export class StrategyService {
    constructor(
        @InjectRepository(Strategy)
        private readonly strategyRepo: Repository<Strategy>,
        @InjectRepository(StrategySchedule)
        private readonly scheduleRepo: Repository<StrategySchedule>,
        @InjectRepository(StrategyExecution)
        private readonly executionRepo: Repository<StrategyExecution>,
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        private readonly messageBroker: MessageBrokerService,
    ) { }

    async createStrategy(userId: string, data: Partial<Strategy>): Promise<Strategy> {
        const strategy = this.strategyRepo.create({
            ...data,
            user: { id: userId },
        });
        return this.strategyRepo.save(strategy);
    }

    async getStrategies(userId: string): Promise<Strategy[]> {
        return this.strategyRepo.find({ where: { user: { id: userId } } });
    }

    async getStrategyById(userId: string, id: string): Promise<Strategy> {
        const strategy = await this.strategyRepo.findOne({
            where: { id, user: { id: userId } },
            relations: ['schedules', 'executions'],
        });
        if (!strategy) throw new NotFoundException('Strategy not found');
        return strategy;
    }

    async updateStrategy(userId: string, id: string, data: Partial<Strategy>): Promise<Strategy> {
        const strategy = await this.getStrategyById(userId, id);
        Object.assign(strategy, data);
        return this.strategyRepo.save(strategy);
    }

    async archiveStrategy(userId: string, id: string): Promise<void> {
        const strategy = await this.getStrategyById(userId, id);
        strategy.status = StrategyStatus.ARCHIVED;
        await this.strategyRepo.save(strategy);
    }

    async createSchedule(userId: string, id: string, data: Partial<StrategySchedule>): Promise<StrategySchedule> {
        const strategy = await this.getStrategyById(userId, id);
        const schedule = this.scheduleRepo.create({
            ...data,
            strategy,
        });
        return this.scheduleRepo.save(schedule);
    }

    async updateSchedule(userId: string, id: string, data: Partial<StrategySchedule>): Promise<StrategySchedule> {
        const strategy = await this.getStrategyById(userId, id);
        const schedule = await this.scheduleRepo.findOne({ where: { strategy: { id: strategy.id } } });
        if (!schedule) throw new NotFoundException('Schedule not found');
        Object.assign(schedule, data);
        return this.scheduleRepo.save(schedule);
    }

    async deleteSchedule(userId: string, id: string): Promise<void> {
        const strategy = await this.getStrategyById(userId, id);
        const schedule = await this.scheduleRepo.findOne({ where: { strategy: { id: strategy.id } } });
        if (schedule) {
            schedule.isActive = false;
            await this.scheduleRepo.save(schedule);
        }
    }

    async getExecutions(userId: string, id: string): Promise<StrategyExecution[]> {
        await this.getStrategyById(userId, id);
        return this.executionRepo.find({
            where: { strategyId: id },
            order: { startedAt: 'DESC' },
        });
    }

    async getExecutionById(userId: string, id: string, execId: string): Promise<StrategyExecution> {
        await this.getStrategyById(userId, id);
        const execution = await this.executionRepo.findOne({
            where: { id: execId, strategyId: id },
            relations: ['order'],
        });
        if (!execution) throw new NotFoundException('Execution not found');
        return execution;
    }

    async executeManual(userId: string, id: string): Promise<StrategyExecution> {
        const strategy = await this.getStrategyById(userId, id);

        const now = new Date();

        const amount = strategy.config?.amount ? Number(strategy.config.amount) : 0;
        const currency = strategy.config?.currency || 'USD';
        const asset = strategy.config?.asset || 'UNKNOWN';

        const order = this.orderRepo.create({
            user: strategy.user,
            portfolio: strategy.portfolio,
            strategy: strategy,
            type: OrderType.CUSTOM,
            status: OrderStatus.RUNNING,
            amount,
            currency,
            asset,
        });
        const savedOrder = await this.orderRepo.save(order);

        const execution = this.executionRepo.create({
            strategyId: strategy.id,
            strategy: strategy,
            order: savedOrder,
            orderId: savedOrder.id,
            status: OrderStatus.RUNNING,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            startedAt: now,
        });
        const savedExecution = await this.executionRepo.save(execution);

        const payload = {
            executionId: savedExecution.id,
            orderId: savedOrder.id,
            config: strategy.config,
        };
        await this.messageBroker.publishEvent('strategy.execution.started', payload);

        return savedExecution;
    }
}
