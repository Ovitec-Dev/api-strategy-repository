import { Repository } from 'typeorm';
import { Strategy, StrategyStatus } from '@/entities/Strategy';
import { StrategyRule } from '@/entities/StrategyRule';
import { EventLog } from '@/entities/EventLog';
import { BacktestResult } from '@/entities/BacktestResult';
import { Validation } from '@/entities/Validation';
import { CreateStrategyDto, UpdateStrategyDto } from '@/dtos/CreateStrategyDto';
import { ValidationResultDto, BacktestResultDto } from '@/dtos/ValidationResultDto';
import { StrategyMapper } from '@/mappers/strategy.mapper';
import { messageBroker } from '@/infrastructure/messageBroker';
import { databaseConnection } from '@/infrastructure/database';
import { UUIDGenerator } from '@/utils/uuid';
import { logger } from '@/utils/logger';

export class StrategyRepository {
  private strategyRepository: Repository<Strategy>;
  private strategyRuleRepository: Repository<StrategyRule>;
  private eventLogRepository: Repository<EventLog>;
  private backtestResultRepository: Repository<BacktestResult>;
  private validationRepository: Repository<Validation>;

  constructor() {
    const dataSource = databaseConnection.getDataSource();
    this.strategyRepository = dataSource.getRepository(Strategy);
    this.strategyRuleRepository = dataSource.getRepository(StrategyRule);
    this.eventLogRepository = dataSource.getRepository(EventLog);
    this.backtestResultRepository = dataSource.getRepository(BacktestResult);
    this.validationRepository = dataSource.getRepository(Validation);
  }

  async createStrategy(dto: CreateStrategyDto): Promise<Strategy> {
    try {
      // Create strategy entity
      const strategyEntity = StrategyMapper.toEntity(dto);
      const strategy = this.strategyRepository.create(strategyEntity);
      
      // Save strategy
      const savedStrategy = await this.strategyRepository.save(strategy);
      
      // Create strategy rules if provided
      if (dto.rules && dto.rules.length > 0) {
        const strategyRules = dto.rules.map(ruleData => {
          const ruleEntity = StrategyMapper.toStrategyRuleEntity(savedStrategy.id, ruleData);
          return this.strategyRuleRepository.create(ruleEntity);
        });
        
        await this.strategyRuleRepository.save(strategyRules);
      }

      // Log event
      await this.logEvent(savedStrategy.id, 'strategy.created', {
        strategy_id: savedStrategy.id,
        user_id: dto.user_id,
        name: dto.name
      });

      // Publish event
      await this.publishStrategyRequested(savedStrategy);

      logger.info('Strategy created successfully', { strategyId: savedStrategy.id });
      return savedStrategy;
    } catch (error) {
      logger.error('Error creating strategy:', error);
      throw error;
    }
  }

  async getStrategyById(id: string): Promise<Strategy | null> {
    try {
      return await this.strategyRepository.findOne({
        where: { id },
        relations: ['strategy_rules', 'strategy_rules.rule', 'backtest_results', 'event_logs']
      });
    } catch (error) {
      logger.error('Error getting strategy by ID:', error);
      throw error;
    }
  }

  async getStrategiesByUserId(userId: string, limit = 10, offset = 0): Promise<Strategy[]> {
    try {
      return await this.strategyRepository.find({
        where: { user_id: userId },
        relations: ['strategy_rules', 'backtest_results'],
        order: { created_at: 'DESC' },
        take: limit,
        skip: offset
      });
    } catch (error) {
      logger.error('Error getting strategies by user ID:', error);
      throw error;
    }
  }

  async updateStrategy(id: string, dto: UpdateStrategyDto): Promise<Strategy | null> {
    try {
      const updateData = StrategyMapper.toUpdateEntity(dto);
      await this.strategyRepository.update(id, updateData);
      
      const updatedStrategy = await this.getStrategyById(id);
      
      if (updatedStrategy) {
        await this.logEvent(id, 'strategy.updated', {
          strategy_id: id,
          updates: updateData
        });
      }

      return updatedStrategy;
    } catch (error) {
      logger.error('Error updating strategy:', error);
      throw error;
    }
  }

  async updateStrategyStatus(id: string, status: StrategyStatus): Promise<void> {
    try {
      await this.strategyRepository.update(id, { status });
      
      await this.logEvent(id, 'strategy.status_updated', {
        strategy_id: id,
        status
      });

      logger.info('Strategy status updated', { strategyId: id, status });
    } catch (error) {
      logger.error('Error updating strategy status:', error);
      throw error;
    }
  }

  async deleteStrategy(id: string): Promise<boolean> {
    try {
      const result = await this.strategyRepository.delete(id);
      
      if (result.affected && result.affected > 0) {
        await this.logEvent(id, 'strategy.deleted', {
          strategy_id: id
        });
        
        logger.info('Strategy deleted successfully', { strategyId: id });
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error deleting strategy:', error);
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
        created_at: strategy.created_at
      };

      const success = await messageBroker.publishEvent('strategy.requested', eventData);
      
      if (success) {
        await this.logEvent(strategy.id, 'strategy.requested', eventData);
      }

      return success;
    } catch (error) {
      logger.error('Error publishing strategy requested event:', error);
      return false;
    }
  }

  async handleValidationResult(validationResult: ValidationResultDto): Promise<void> {
    try {
      const { strategy_id, is_valid, validation_messages, risk_assessment } = validationResult;
      
      // Update strategy status
      const status = is_valid ? StrategyStatus.VALIDATED : StrategyStatus.INVALID;
      await this.updateStrategyStatus(strategy_id, status);

      // Log validation result
      await this.logEvent(strategy_id, 'strategy.validated', {
        strategy_id,
        is_valid,
        validation_messages,
        risk_assessment
      });

      logger.info('Validation result handled', { strategyId: strategy_id, isValid: is_valid });
    } catch (error) {
      logger.error('Error handling validation result:', error);
      throw error;
    }
  }

  async handleBacktestResult(backtestResult: BacktestResultDto): Promise<void> {
    try {
      const { strategy_id, user_id, performance_metrics, trade_log } = backtestResult;
      
      // Create backtest result entity
      const backtestEntity = this.backtestResultRepository.create({
        strategy_id,
        user_id,
        performance_metrics,
        trade_log
      });
      
      await this.backtestResultRepository.save(backtestEntity);

      // Update strategy status
      await this.updateStrategyStatus(strategy_id, StrategyStatus.TESTED);

      // Log backtest result
      await this.logEvent(strategy_id, 'backtest.completed', {
        strategy_id,
        backtest_id: backtestEntity.id,
        performance_metrics
      });

      logger.info('Backtest result handled', { strategyId: strategy_id, backtestId: backtestEntity.id });
    } catch (error) {
      logger.error('Error handling backtest result:', error);
      throw error;
    }
  }

  async logEvent(strategyId: string, eventType: string, payload: any): Promise<void> {
    try {
      const eventLog = this.eventLogRepository.create({
        strategy_id: strategyId,
        event_type: eventType,
        payload
      });
      
      await this.eventLogRepository.save(eventLog);
    } catch (error) {
      logger.error('Error logging event:', error);
    }
  }

  async getEventLogs(strategyId: string, limit = 50): Promise<EventLog[]> {
    try {
      return await this.eventLogRepository.find({
        where: { strategy_id: strategyId },
        order: { timestamp: 'DESC' },
        take: limit
      });
    } catch (error) {
      logger.error('Error getting event logs:', error);
      throw error;
    }
  }

  async getStrategyMetrics(strategyId: string): Promise<any> {
    try {
      const strategy = await this.getStrategyById(strategyId);
      if (!strategy) {
        return null;
      }

      const latestBacktest = strategy.backtest_results?.[0];
      const eventLogs = await this.getEventLogs(strategyId, 10);

      return {
        strategy_id: strategyId,
        name: strategy.name,
        status: strategy.status,
        created_at: strategy.created_at,
        updated_at: strategy.updated_at,
        latest_backtest: latestBacktest ? {
          performance_metrics: latestBacktest.performance_metrics,
          tested_at: latestBacktest.tested_at
        } : null,
        recent_events: eventLogs.map(log => ({
          event_type: log.event_type,
          timestamp: log.timestamp,
          payload: log.payload
        }))
      };
    } catch (error) {
      logger.error('Error getting strategy metrics:', error);
      throw error;
    }
  }
} 