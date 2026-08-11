/** Interfaces para los datos de estrategias */

export interface IRuleInput {
    rule_id: string;
    parameters?: Record<string, any>;
}

export interface ICreateStrategy {
    name: string;
    description?: string;
    user_id: string;
    rules?: IRuleInput[];
    metadata?: Record<string, any>;
}

export interface IUpdateStrategy {
    name?: string;
    description?: string;
    status?: string;
    rules?: IRuleInput[];
    metadata?: Record<string, any>;
}

export interface IValidationResult {
    strategy_id: string;
    is_valid: boolean;
    validation_messages?: string[];
    risk_assessment?: Record<string, any>;
    validated_at?: Date;
}

export interface IPerformanceMetrics {
    total_return: number;
    sharpe_ratio: number;
    max_drawdown: number;
    win_rate: number;
    total_trades: number;
    profitable_trades: number;
}

export interface IBacktestResult {
    strategy_id: string;
    user_id: string;
    performance_metrics: IPerformanceMetrics;
    trade_log: Record<string, any>[];
    tested_at?: Date;
}

export interface IEventMessage {
    event_id: string;
    event_type: string;
    timestamp: Date;
    data: Record<string, any>;
    metadata?: Record<string, any>;
}

export interface IStrategyDto {
    id: string;
    name: string;
    description: string;
    user_id: string;
    status: string;
    created_at: Date;
    updated_at: Date;
    strategy_rules?: {
        id: string;
        rule_id: string;
        parameters: Record<string, any>;
    }[];
}
