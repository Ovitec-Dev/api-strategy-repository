import { Strategy, StrategyStatus } from '@/entities/Strategy';
import { StrategyRule } from '@/entities/StrategyRule';
import { CreateStrategyDto, UpdateStrategyDto } from '@/dtos/CreateStrategyDto';
import { ValidationResultDto, BacktestResultDto } from '@/dtos/ValidationResultDto';

export class StrategyMapper {
  static toEntity(dto: CreateStrategyDto): Partial<Strategy> {
    return {
      name: dto.name,
      description: dto.description,
      user_id: dto.user_id,
      status: StrategyStatus.PENDING
    };
  }

  static toDto(entity: Strategy): any {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      user_id: entity.user_id,
      status: entity.status,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      strategy_rules: entity.strategy_rules?.map(rule => ({
        id: rule.id,
        rule_id: rule.rule_id,
        parameters: rule.parameters,
        assigned_at: rule.assigned_at
      }))
    };
  }

  static toUpdateEntity(dto: UpdateStrategyDto): Partial<Strategy> {
    const updateData: Partial<Strategy> = {};
    
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status !== undefined) updateData.status = dto.status as StrategyStatus;
    
    return updateData;
  }

  static toStrategyRuleEntity(strategyId: string, ruleData: any): Partial<StrategyRule> {
    return {
      strategy_id: strategyId,
      rule_id: ruleData.rule_id,
      parameters: ruleData.parameters || {}
    };
  }

  static toValidationResultDto(data: any): ValidationResultDto {
    return {
      strategy_id: data.strategy_id,
      is_valid: data.is_valid,
      validation_messages: data.validation_messages,
      risk_assessment: data.risk_assessment,
      validated_at: data.validated_at ? new Date(data.validated_at) : new Date()
    };
  }

  static toBacktestResultDto(data: any): BacktestResultDto {
    return {
      strategy_id: data.strategy_id,
      user_id: data.user_id,
      performance_metrics: data.performance_metrics,
      trade_log: data.trade_log,
      tested_at: data.tested_at ? new Date(data.tested_at) : new Date()
    };
  }
} 