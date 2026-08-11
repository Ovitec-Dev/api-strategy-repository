import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/sub-category.entity';
import { Portfolio } from '../portfolio/entities/portfolio.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
        @InjectRepository(SubCategory)
        private readonly subCategoryRepo: Repository<SubCategory>,
        @InjectRepository(Portfolio)
        private readonly portfolioRepo: Repository<Portfolio>,
    ) { }

    async createCategory(userId: string, data: Partial<Category>): Promise<Category> {
        const category = this.categoryRepo.create({
            ...data,
            user: { id: userId },
            isSystem: false,
        });
        return this.categoryRepo.save(category);
    }

    async getCategories(userId: string): Promise<Category[]> {
        return this.categoryRepo.createQueryBuilder('category')
            .where('category.user = :userId OR category.isSystem = true', { userId })
            .getMany();
    }

    async updateCategory(userId: string, id: string, data: Partial<Category>): Promise<Category> {
        const category = await this.categoryRepo.findOne({ where: { id }, relations: ['user'] });
        if (!category) throw new NotFoundException('Category not found');
        if (category.isSystem || category.user?.id !== userId) {
            throw new ForbiddenException('Cannot modify this category');
        }

        Object.assign(category, data);
        return this.categoryRepo.save(category);
    }

    async deleteCategory(userId: string, id: string): Promise<void> {
        const category = await this.categoryRepo.findOne({ where: { id }, relations: ['user'] });
        if (!category) throw new NotFoundException('Category not found');
        if (category.isSystem || category.user?.id !== userId) {
            throw new ForbiddenException('Cannot delete this category');
        }

        await this.categoryRepo.remove(category);
    }

    async createSubCategory(userId: string, categoryId: string, data: Partial<SubCategory>): Promise<SubCategory> {
        const category = await this.categoryRepo.findOne({ where: { id: categoryId }, relations: ['user'] });
        if (!category || (category.user?.id !== userId && !category.isSystem)) {
            throw new NotFoundException('Category not found or access denied');
        }

        const subCategory = this.subCategoryRepo.create({ ...data, category });
        return this.subCategoryRepo.save(subCategory);
    }

    async getSubCategory(userId: string, categoryId: string, subId: string): Promise<SubCategory> {
        const sub = await this.subCategoryRepo.findOne({
            where: { id: subId, category: { id: categoryId } },
            relations: ['category', 'category.user'],
        });
        if (!sub || (sub.category.user?.id !== userId && !sub.category.isSystem)) {
            throw new NotFoundException('Subcategory not found or access denied');
        }
        return sub;
    }

    async updateSubCategory(userId: string, categoryId: string, subId: string, data: Partial<SubCategory> & { portfolio_id?: string }): Promise<SubCategory> {
        const sub = await this.subCategoryRepo.findOne({
            where: { id: subId, category: { id: categoryId } },
            relations: ['category', 'category.user'],
        });
        if (!sub || (sub.category.user?.id !== userId && !sub.category.isSystem)) {
            throw new NotFoundException('Subcategory not found or access denied');
        }

        const { name, portfolio_id } = data;
        if (name !== undefined) sub.name = name;
        if (portfolio_id !== undefined) {
            const portfolio = await this.portfolioRepo.findOne({ where: { id: portfolio_id, user: { id: userId } } });
            if (!portfolio) throw new NotFoundException('Portfolio not found');
            sub.portfolio = portfolio;
        }
        return this.subCategoryRepo.save(sub);
    }

    async deleteSubCategory(userId: string, categoryId: string, subId: string): Promise<void> {
        const sub = await this.subCategoryRepo.findOne({ where: { id: subId, category: { id: categoryId } }, relations: ['category', 'category.user'] });
        if (!sub || (sub.category.user?.id !== userId && !sub.category.isSystem)) {
            throw new ForbiddenException('Cannot delete this subcategory');
        }
        await this.subCategoryRepo.remove(sub);
    }
}
