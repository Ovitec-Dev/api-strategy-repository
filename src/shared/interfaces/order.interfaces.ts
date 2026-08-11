import { OrderType, OrderStatus } from '@shared/types';

export interface IOrder {
    id: string;
    user_id: string;
    portfolio_id?: string;
    strategy_id?: string;
    externalRef?: string;
    type: OrderType | string;
    status: OrderStatus | string;
    asset: string;
    amount: number;
    currency: string;
    executedAmount?: number;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

export interface ICreateOrderDto {
    portfolio_id?: string;
    strategy_id?: string;
    externalRef?: string;
    type: OrderType | string;
    asset: string;
    amount: number;
    currency: string;
    metadata?: Record<string, any>;
}
