import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLog, LogLevel } from './entities/operation-log.entity';

export interface LogMeta {
    orderId?: string;
    strategyId?: string;
    executionId?: string;
    [key: string]: any;
}

@Injectable()
export class LoggingService {
    constructor(
        @InjectRepository(OperationLog)
        private readonly logRepo: Repository<OperationLog>,
    ) { }

    async persist(
        level: LogLevel | string,
        message: string,
        context?: string,
        meta?: LogMeta,
    ): Promise<void> {
        const log = this.logRepo.create({
            level: level as LogLevel,
            message,
            context,
            orderId: meta?.orderId,
            strategyId: meta?.strategyId,
            executionId: meta?.executionId,
            metadata: meta,
            timestamp: new Date(),
        });

        await this.logRepo.save(log);
    }

    async getLogsByOrder(orderId: string): Promise<OperationLog[]> {
        return this.logRepo.find({
            where: { orderId },
            order: { timestamp: 'ASC' },
        });
    }

    async getLogsByExecution(executionId: string): Promise<OperationLog[]> {
        return this.logRepo.find({
            where: { executionId },
            order: { timestamp: 'ASC' },
        });
    }

    async getLogs(filters: any): Promise<OperationLog[]> {
        const query = this.logRepo.createQueryBuilder('log');

        if (filters.orderId) {
            query.andWhere('log.orderId = :orderId', { orderId: filters.orderId });
        }
        if (filters.level) {
            query.andWhere('log.level = :level', { level: filters.level });
        }
        if (filters.startDate) {
            query.andWhere('log.timestamp >= :start', { start: filters.startDate });
        }
        if (filters.endDate) {
            query.andWhere('log.timestamp <= :end', { end: filters.endDate });
        }

        return query.orderBy('log.timestamp', 'DESC').getMany();
    }
}
