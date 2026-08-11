import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Strategy, StrategyStatus } from '../entities/strategy.entity';
import { StrategyRule } from '../entities/strategy-rule.entity';
import { EventLog } from '../entities/event-log.entity';
import { BacktestResult } from '../entities/backtest-result.entity';
import { Validation } from '../entities/validation.entity';
import { CreateStrategyDto, UpdateStrategyDto } from '@/dtos/CreateStrategyDto';
import { ValidationResultDto, BacktestResultDto } from '@/dtos/ValidationResultDto';
import { StrategyMapper } from '@/mappers/strategy.mapper';
import { MessageBrokerService } from '@shared/messaging/messaging.service';

@Injectable()
export class StrategyRepository {
  private readonly logger = new Logger(StrategyRepository.name);

  constructor(
    @InjectRepository(Strategy)
    private readonly strategyRepo: Repository<Strategy>,
    @InjectRepository(StrategyRule)
    private readonly strategyRuleRepo: Repository<StrategyRule>,
    @InjectRepository(EventLog)
    private readonly eventLogRepo: Repository<EventLog>,
    @InjectRepository(BacktestResult)
    private readonly backtestResultRepo: Repository<BacktestResult>,
    @InjectRepository(Validation)
    private readonly validationRepo: Repository<Validation>,
    private readonly messageBroker: MessageBrokerService,
  ) { }

  async createStrategy(dto: CreateStrategyDto): Promise<Strategy> {
    try {
      const strategyData = StrategyMapper.toEntity(dto);
      const strategy = this.strategyRepo.create(strategyData);
      const savedStrategy = await this.strategyRepo.save(strategy);

      if (dto.rules && dto.rules.length > 0) {
        const strategyRules = dto.rules.map((ruleData) => {
          const ruleEntity = StrategyMapper.toStrategyRuleEntity(savedStrategy.id, ruleData);
          return this.strategyRuleRepo.create(ruleEntity);
        });
        await this.strategyRuleRepo.save(strategyRules);
      }

      await this.logEvent(savedStrategy.id, 'strategy.created', {
        strategy_id: savedStrategy.id,
        user_id: dto.user_id,
        name: dto.name,
      });

      await this.publishStrategyRequested(savedStrategy);
      this.logger.log(`Strategy created: ${savedStrategy.id}`);
      return savedStrategy;
    } catch (error) {
      this.logger.error('Error creating strategy:', error);
      throw error;
    }
  }

  async getStrategyById(id: string): Promise<Strategy | null> {
    try {
      return await this.strategyRepo.findOne({
        where: { id },
        relations: ['strategy_rules', 'strategy_rules.rule', 'backtest_results', 'event_logs'],
      });
    } catch (error) {
      this.logger.error('Error getting strategy by ID:', error);
      throw error;
    }
  }

  async getStrategiesByUserId(userId: string, limit = 10, offset = 0): Promise<Strategy[]> {
    try {
      return await this.strategyRepo.find({
        where: { user_id: userId },
        relations: ['strategy_rules', 'backtest_results'],
        order: { created_at: 'DESC' },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      this.logger.error('Error getting strategies by user ID:', error);
      throw error;
    }
  }

  async updateStrategy(id: string, dto: UpdateStrategyDto): Promise<Strategy | null> {
    try {
      const updateData = StrategyMapper.toUpdateEntity(dto);
      await this.strategyRepo.update(id, updateData);
      const updatedStrategy = await this.getStrategyById(id);
      if (updatedStrategy) {
        await this.logEvent(id, 'strategy.updated', { strategy_id: id, updates: updateData });
      }
      return updatedStrategy;
    } catch (error) {
      this.logger.error('Error updating strategy:', error);
      throw error;
    }
  }

  async updateStrategyStatus(id: string, status: StrategyStatus | string): Promise<void> {
    try {
      await this.strategyRepo.update(id, { status: status as StrategyStatus });
      await this.logEvent(id, 'strategy.status_updated', { strategy_id: id, status });
      this.logger.log(`Strategy status updated: ${id} → ${status}`);
    } catch (error) {
      this.logger.error('Error updating strategy status:', error);
      throw error;
    }
  }

  async deleteStrategy(id: string): Promise<boolean> {
    try {
      const result = await this.strategyRepo.delete(id);
      if (result.affected && result.affected > 0) {
        await this.logEvent(id, 'strategy.deleted', { strategy_id: id });
        this.logger.log(`Strategy deleted: ${id}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error deleting strategy:', error);
      throw error;
    }
  }

  async publishStrategyRequested(strategy: Strategy): Promise<boolean> {
    try {
      const eventData = {
        strategy_id: strategy.id,
        user_id: strategy.user_id,
        name: strategy.name,
        description: strategy.description,
        status: strategy.status,
        created_at: strategy.created_at,
      };
      const success = await this.messageBroker.publishEvent('strategy.requested', eventData);
      if (success) await this.logEvent(strategy.id, 'strategy.requested', eventData);
      return success;
    } catch (error) {
      this.logger.error('Error publishing strategy requested event:', error);
      return false;
    }
  }

  async handleValidationResult(validationResult: ValidationResultDto): Promise<void> {
    try {
      const { strategy_id, is_valid, validation_messages, risk_assessment } = validationResult;
      const status = is_valid ? StrategyStatus.VALIDATED : StrategyStatus.INVALID;
      await this.updateStrategyStatus(strategy_id, status);
      await this.logEvent(strategy_id, 'strategy.validated', {
        strategy_id,
        is_valid,
        validation_messages,
        risk_assessment,
      });
    } catch (error) {
      this.logger.error('Error handling validation result:', error);
      throw error;
    }
  }

  async handleBacktestResult(backtestResult: BacktestResultDto): Promise<void> {
    try {
      const { strategy_id, user_id, performance_metrics, trade_log } = backtestResult;
      const backtestEntity = this.backtestResultRepo.create({
        strategy_id,
        user_id,
        performance_metrics,
        trade_log,
      });
      await this.backtestResultRepo.save(backtestEntity);
      await this.updateStrategyStatus(strategy_id, StrategyStatus.TESTED);
      await this.logEvent(strategy_id, 'backtest.completed', {
        strategy_id,
        backtest_id: backtestEntity.id,
        performance_metrics,
      });
    } catch (error) {
      this.logger.error('Error handling backtest result:', error);
      throw error;
    }
  }

  async logEvent(strategyId: string, eventType: string, payload: any): Promise<void> {
    try {
      const eventLog = this.eventLogRepo.create({ strategy_id: strategyId, event_type: eventType, payload });
      await this.eventLogRepo.save(eventLog);
    } catch (error) {
      this.logger.error('Error logging event:', error);
    }
  }

  async getEventLogs(strategyId: string, limit = 50): Promise<EventLog[]> {
    try {
      return await this.eventLogRepo.find({
        where: { strategy_id: strategyId },
        order: { timestamp: 'DESC' },
        take: limit,
      });
    } catch (error) {
      this.logger.error('Error getting event logs:', error);
      throw error;
    }
  }

  async getStrategyMetrics(strategyId: string): Promise<any> {
    try {
      const strategy = await this.getStrategyById(strategyId);
      if (!strategy) return null;
      const latestBacktest = strategy.backtest_results?.[0];
      const eventLogs = await this.getEventLogs(strategyId, 10);
      return {
        strategy_id: strategyId,
        name: strategy.name,
        status: strategy.status,
        created_at: strategy.created_at,
        updated_at: strategy.updated_at,
        latest_backtest: latestBacktest
          ? { performance_metrics: latestBacktest.performance_metrics, tested_at: latestBacktest.tested_at }
          : null,
        recent_events: eventLogs.map((log) => ({
          event_type: log.event_type,
          timestamp: log.timestamp,
          payload: log.payload,
        })),
      };
    } catch (error) {
      this.logger.error('Error getting strategy metrics:', error);
      throw error;
    }
  }
}
