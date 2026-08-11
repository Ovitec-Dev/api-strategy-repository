import { CategoryType } from '@shared/types';

export interface ICategory {
    id: string;
    user_id?: string;
    portfolio_id?: string;
    name: string;
    type: CategoryType | string;
    color?: string;
    icon?: string;
    isSystem: boolean;
    createdAt: Date;
}

export interface ISubCategory {
    id: string;
    category_id: string;
    portfolio_id?: string;
    name: string;
    createdAt: Date;
}

export interface ICreateCategoryDto {
    portfolio_id?: string;
    name: string;
    type: CategoryType | string;
    color?: string;
    icon?: string;
}

export interface ICreateSubCategoryDto {
    category_id: string;
    portfolio_id?: string;
    name: string;
}

export interface IUpdateSubCategoryDto {
    portfolio_id?: string;
    name?: string;
}
