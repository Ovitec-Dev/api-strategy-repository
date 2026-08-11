import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,
    ) { }

    async createTransaction(userId: string, data: Partial<Transaction>): Promise<Transaction> {
        const transaction = this.transactionRepo.create({
            ...data,
            user: { id: userId },
        });
        return this.transactionRepo.save(transaction);
    }

    async getTransactions(userId: string, filters: any): Promise<Transaction[]> {
        const query = this.transactionRepo.createQueryBuilder('trx')
            .leftJoinAndSelect('trx.portfolio', 'portfolio')
            .leftJoinAndSelect('trx.category', 'category')
            .leftJoinAndSelect('trx.order', 'order')
            .where('trx.user = :userId', { userId });

        if (filters.portfolioId) {
            query.andWhere('trx.portfolio = :portfolioId', { portfolioId: filters.portfolioId });
        }
        if (filters.category) {
            query.andWhere('trx.category = :category', { category: filters.category });
        }
        if (filters.type) {
            query.andWhere('trx.type = :type', { type: filters.type });
        }
        if (filters.startDate && filters.endDate) {
            query.andWhere('trx.date BETWEEN :start AND :end', { start: filters.startDate, end: filters.endDate });
        }

        return query.orderBy('trx.date', 'DESC').getMany();
    }

    async getTransactionById(userId: string, id: string): Promise<Transaction> {
        const trx = await this.transactionRepo.findOne({
            where: { id, user: { id: userId } },
            relations: ['portfolio', 'category', 'subCategory', 'order'],
        });
        if (!trx) throw new NotFoundException('Transaction not found');
        return trx;
    }

    async updateTransaction(userId: string, id: string, data: Partial<Transaction>): Promise<Transaction> {
        const trx = await this.getTransactionById(userId, id);
        Object.assign(trx, data);
        return this.transactionRepo.save(trx);
    }

    async deleteTransaction(userId: string, id: string): Promise<void> {
        const trx = await this.getTransactionById(userId, id);
        await this.transactionRepo.remove(trx);
    }
}
