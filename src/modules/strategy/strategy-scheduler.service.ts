import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as crypto from 'crypto';
import { StrategyExecution } from './entities/strategy-execution.entity';
import { StrategySchedule } from './entities/strategy-schedule.entity';
import { Order, OrderStatus, OrderType } from '@modules/order/entities/order.entity';
import { MessageBrokerService } from '@shared/messaging/messaging.service';

@Injectable()
export class StrategySchedulerService implements OnModuleInit {
    private readonly logger = new Logger(StrategySchedulerService.name);

    constructor(
        @InjectRepository(StrategyExecution)
        private readonly executionRepo: Repository<StrategyExecution>,
        @InjectRepository(StrategySchedule)
        private readonly scheduleRepo: Repository<StrategySchedule>,
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        private readonly dataSource: DataSource,
        private readonly messageBroker: MessageBrokerService,
    ) { }

    onModuleInit() {
        this.logger.log('StrategySchedulerService initialized, CRON jobs scheduled');
    }

    // UUID to numeric hash for pg_advisory_lock
    private uuidToNumeric(uuid: string): string {
        const hash = crypto.createHash('sha256').update(uuid).digest('hex');
        // take first 15 chars and parse as int to fit in bigint
        return parseInt(hash.substring(0, 15), 16).toString();
    }

    async acquireExecutionLock(executionId: string): Promise<boolean> {
        const numericId = this.uuidToNumeric(executionId);
        const result = await this.dataSource.query(
            'SELECT pg_try_advisory_lock($1) as acquired',
            [numericId],
        );
        return result[0].acquired;
    }

    async releaseExecutionLock(executionId: string): Promise<void> {
        const numericId = this.uuidToNumeric(executionId);
        await this.dataSource.query('SELECT pg_advisory_unlock($1)', [numericId]);
    }

    // Run every minute
    @Cron('* * * * *')
    async checkSchedules(): Promise<void> {
        const now = new Date();
        const activeSchedules = await this.scheduleRepo.find({
            where: { isActive: true },
            relations: ['strategy', 'strategy.portfolio', 'strategy.user'],
        });

        for (const schedule of activeSchedules) {
            if (schedule.nextRunAt && schedule.nextRunAt <= now) {
                await this.triggerScheduledExecution(schedule, now);
            }
        }
    }

    private async triggerScheduledExecution(schedule: StrategySchedule, now: Date): Promise<void> {
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // 1. Try to create execution record (Idempotency check via Unique Constraint)
        let execution: StrategyExecution;
        try {
            execution = this.executionRepo.create({
                strategyId: schedule.strategy.id,
                strategy: schedule.strategy,
                schedule,
                status: OrderStatus.PENDING,
                month: currentMonth,
                year: currentYear,
            });
            execution = await this.executionRepo.save(execution);
        } catch (e: any) {
            // 23505 is PostgreSQL unique constraint violation
            if (e.code === '23505') {
                this.logger.debug(`Execution for strategy ${schedule.strategy.id} in ${currentMonth}/${currentYear} already exists. Skipping.`);
                return;
            }
            this.logger.error('Failed to create StrategyExecution', e);
            return;
        }

        // 2. Acquire lock to prevent parallel workers from picking it up
        const locked = await this.acquireExecutionLock(execution.id);
        if (!locked) {
            this.logger.warn(`Execution ${execution.id} is already locked by another worker.`);
            return;
        }

        try {
            execution.startedAt = new Date();
            execution.status = OrderStatus.RUNNING;

            // 3. Create interconnected Order
            const amount = schedule.strategy.config?.amount ? Number(schedule.strategy.config.amount) : 0;
            const currency = schedule.strategy.config?.currency || 'USD';
            const asset = schedule.strategy.config?.asset || 'UNKNOWN';

            const order = this.orderRepo.create({
                user: schedule.strategy.user,
                portfolio: schedule.strategy.portfolio,
                strategy: schedule.strategy,
                type: OrderType.CUSTOM,
                status: OrderStatus.RUNNING,
                amount,
                currency,
                asset,
            });
            const savedOrder = await this.orderRepo.save(order);

            execution.order = savedOrder;
            execution.orderId = savedOrder.id;
            await this.executionRepo.save(execution);

            // 4. Publish to RabbitMQ
            const payload = {
                executionId: execution.id,
                orderId: savedOrder.id,
                config: schedule.strategy.config,
            };

            const published = await this.messageBroker.publishEvent('strategy.execution.started', payload);
            if (!published) {
                throw new Error('Failed to publish RabbitMQ event');
            }

            this.logger.log(`Triggered scheduled execution ${execution.id} for strategy ${schedule.strategy.id}`);
        } catch (error: any) {
            this.logger.error(`Failed to process execution ${execution.id}:`, error);
            execution.status = OrderStatus.FAILED;
            execution.errorMessage = error.message;
            execution.finishedAt = new Date();
            await this.executionRepo.save(execution);

            if (execution.orderId) {
                await this.orderRepo.update(execution.orderId, { status: OrderStatus.FAILED });
            }
        } finally {
            await this.releaseExecutionLock(execution.id);
        }
    }

    // Recover orphaned RUNNING executions (older than 15 mins)
    @Cron('*/5 * * * *')
    async recoverOrphanedExecutions(): Promise<void> {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        const orphaned = await this.executionRepo
            .createQueryBuilder('e')
            .where('e.status = :status', { status: OrderStatus.RUNNING })
            .andWhere('e.startedAt < :cutoff', { cutoff: fifteenMinutesAgo })
            .getMany();

        for (const exec of orphaned) {
            exec.status = OrderStatus.FAILED;
            exec.errorMessage = 'Process died unexpectedly — recovered by scheduler';
            exec.finishedAt = new Date();
            await this.executionRepo.save(exec);

            if (exec.orderId) {
                await this.orderRepo.update(exec.orderId, { status: OrderStatus.FAILED });
            }

            this.logger.error(`Orphaned execution ${exec.id} recovered. Marked as FAILED.`);
        }
    }
}
