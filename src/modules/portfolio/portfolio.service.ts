import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { Budget } from './entities/budget.entity';

@Injectable()
export class PortfolioService {
    constructor(
        @InjectRepository(Portfolio)
        private readonly portfolioRepo: Repository<Portfolio>,
        @InjectRepository(Budget)
        private readonly budgetRepo: Repository<Budget>,
    ) { }

    async createPortfolio(userId: string, data: Partial<Portfolio>): Promise<Portfolio> {
        const isFirst = (await this.portfolioRepo.count({ where: { user: { id: userId } } })) === 0;

        const portfolio = this.portfolioRepo.create({
            ...data,
            user: { id: userId },
            isDefault: data.isDefault ?? isFirst,
        });

        if (portfolio.isDefault) {
            await this.portfolioRepo.update({ user: { id: userId } }, { isDefault: false });
        }

        return this.portfolioRepo.save(portfolio);
    }

    async getPortfolios(userId: string): Promise<Portfolio[]> {
        return this.portfolioRepo.find({ where: { user: { id: userId } } });
    }

    async getPortfolioById(userId: string, id: string): Promise<Portfolio> {
        const portfolio = await this.portfolioRepo.findOne({ where: { id, user: { id: userId } } });
        if (!portfolio) throw new NotFoundException('Portfolio not found');
        return portfolio;
    }

    async updatePortfolio(userId: string, id: string, data: Partial<Portfolio>): Promise<Portfolio> {
        const portfolio = await this.getPortfolioById(userId, id);
        if (data.isDefault && !portfolio.isDefault) {
            await this.portfolioRepo.update({ user: { id: userId } }, { isDefault: false });
        }
        Object.assign(portfolio, data);
        return this.portfolioRepo.save(portfolio);
    }

    async deletePortfolio(userId: string, id: string): Promise<void> {
        const portfolio = await this.getPortfolioById(userId, id);
        await this.portfolioRepo.remove(portfolio);
    }

    // Budget methods
    async createBudget(userId: string, portfolioId: string, data: Partial<Budget>): Promise<Budget> {
        const portfolio = await this.getPortfolioById(userId, portfolioId);
        const budget = this.budgetRepo.create({ ...data, portfolio });
        return this.budgetRepo.save(budget);
    }

    async getBudgets(userId: string, portfolioId: string): Promise<Budget[]> {
        await this.getPortfolioById(userId, portfolioId); // ensure ownership
        return this.budgetRepo.find({ where: { portfolio: { id: portfolioId } } });
    }

    async updateBudget(userId: string, portfolioId: string, budgetId: string, data: Partial<Budget>): Promise<Budget> {
        await this.getPortfolioById(userId, portfolioId); // ensure ownership
        const budget = await this.budgetRepo.findOne({ where: { id: budgetId, portfolio: { id: portfolioId } } });
        if (!budget) throw new NotFoundException('Budget not found');
        Object.assign(budget, data);
        return this.budgetRepo.save(budget);
    }

    async deleteBudget(userId: string, portfolioId: string, budgetId: string): Promise<void> {
        await this.getPortfolioById(userId, portfolioId); // ensure ownership
        const budget = await this.budgetRepo.findOne({ where: { id: budgetId, portfolio: { id: portfolioId } } });
        if (!budget) throw new NotFoundException('Budget not found');
        await this.budgetRepo.remove(budget);
    }
}
