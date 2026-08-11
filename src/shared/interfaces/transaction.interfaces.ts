export interface ITransaction {
    id: string;
    user_id: string;
    portfolio_id: string;
    category_id?: string;
    sub_category_id?: string;
    order_id?: string;
    type: string;
    amount: number;
    currency: string;
    description?: string;
    date: Date;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateTransactionDto {
    portfolio_id: string;
    category_id?: string;
    sub_category_id?: string;
    order_id?: string;
    type: string;
    amount: number;
    currency: string;
    description?: string;
    date: Date;
    metadata?: Record<string, any>;
}
