export interface IPortfolio {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    currency: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreatePortfolioDto {
    name: string;
    description?: string;
    currency?: string;
    isDefault?: boolean;
}

export interface IUpdatePortfolioDto {
    name?: string;
    description?: string;
    currency?: string;
    isDefault?: boolean;
}
