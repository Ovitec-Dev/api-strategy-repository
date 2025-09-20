import { messageBroker } from '@/infrastructure/messageBroker';
import { StrategyRepository } from '@/repositories/StrategyRepository';
import { ValidationResultDto, BacktestResultDto, EventMessageDto } from '@/dtos/ValidationResultDto';
import { logger } from '@/utils/logger';

export class EventConsumer {
  private strategyRepository: StrategyRepository;

  constructor() {
    this.strategyRepository = new StrategyRepository();
  }

  async initialize(): Promise<void> {
    try {
      // Subscribe to validation events
      await messageBroker.subscribeToEvent('strategy.validated', this.handleStrategyValidated.bind(this));
      await messageBroker.subscribeToEvent('strategy.invalidated', this.handleStrategyInvalidated.bind(this));
      
      // Subscribe to backtesting events
      await messageBroker.subscribeToEvent('backtest.completed', this.handleBacktestCompleted.bind(this));
      
      // Subscribe to error events
      await messageBroker.subscribeToEvent('strategy.failed', this.handleStrategyFailed.bind(this));
      await messageBroker.subscribeToEvent('backtest.failed', this.handleBacktestFailed.bind(this));
      
      // Subscribe to evaluation events
      await messageBroker.subscribeToEvent('evaluation.completed', this.handleEvaluationCompleted.bind(this));
      
      logger.info('Event consumer initialized successfully');
    } catch (error) {
      logger.error('Error initializing event consumer:', error);
      throw error;
    }
  }

  private async handleStrategyValidated(message: any): Promise<void> {
    try {
      const eventData = message.data;
      logger.info('Handling strategy.validated event', { strategyId: eventData.strategy_id });

      const validationResult: ValidationResultDto = {
        strategy_id: eventData.strategy_id,
        is_valid: true,
        validation_messages: eventData.validation_messages || [],
        risk_assessment: eventData.risk_assessment || {},
        validated_at: new Date()
      };

      await this.strategyRepository.handleValidationResult(validationResult);
      
      logger.info('Strategy validation handled successfully', { strategyId: eventData.strategy_id });
    } catch (error) {
      logger.error('Error handling strategy.validated event:', error);
    }
  }

  private async handleStrategyInvalidated(message: any): Promise<void> {
    try {
      const eventData = message.data;
      logger.info('Handling strategy.invalidated event', { strategyId: eventData.strategy_id });

      const validationResult: ValidationResultDto = {
        strategy_id: eventData.strategy_id,
        is_valid: false,
        validation_messages: eventData.validation_messages || [],
        risk_assessment: eventData.risk_assessment || {},
        validated_at: new Date()
      };

      await this.strategyRepository.handleValidationResult(validationResult);
      
      logger.info('Strategy invalidation handled successfully', { strategyId: eventData.strategy_id });
    } catch (error) {
      logger.error('Error handling strategy.invalidated event:', error);
    }
  }

  private async handleBacktestCompleted(message: any): Promise<void> {
    try {
      const eventData = message.data;
      logger.info('Handling backtest.completed event', { strategyId: eventData.strategy_id });

      const backtestResult: BacktestResultDto = {
        strategy_id: eventData.strategy_id,
        user_id: eventData.user_id,
        performance_metrics: eventData.performance_metrics || {},
        trade_log: eventData.trade_log || [],
        tested_at: new Date()
      };

      await this.strategyRepository.handleBacktestResult(backtestResult);
      
      logger.info('Backtest completion handled successfully', { strategyId: eventData.strategy_id });
    } catch (error) {
      logger.error('Error handling backtest.completed event:', error);
    }
  }

  private async handleStrategyFailed(message: any): Promise<void> {
    try {
      const eventData = message.data;
      logger.info('Handling strategy.failed event', { strategyId: eventData.strategy_id });

      // Update strategy status to failed
      await this.strategyRepository.updateStrategyStatus(eventData.strategy_id, 'failed');

      // Log the failure event
      await this.strategyRepository.logEvent(eventData.strategy_id, 'strategy.failed', {
        strategy_id: eventData.strategy_id,
        error: eventData.error,
        timestamp: new Date()
      });

      logger.info('Strategy failure handled successfully', { strategyId: eventData.strategy_id });
    } catch (error) {
      logger.error('Error handling strategy.failed event:', error);
    }
  }

  private async handleBacktestFailed(message: any): Promise<void> {
    try {
      const eventData = message.data;
      logger.info('Handling backtest.failed event', { strategyId: eventData.strategy_id });

      // Update strategy status to failed
      await this.strategyRepository.updateStrategyStatus(eventData.strategy_id, 'failed');

      // Log the backtest failure event
      await this.strategyRepository.logEvent(eventData.strategy_id, 'backtest.failed', {
        strategy_id: eventData.strategy_id,
        error: eventData.error,
        timestamp: new Date()
      });

      logger.info('Backtest failure handled successfully', { strategyId: eventData.strategy_id });
    } catch (error) {
      logger.error('Error handling backtest.failed event:', error);
    }
  }

  private async handleEvaluationCompleted(message: any): Promise<void> {
    try {
      const eventData = message.data;
      logger.info('Handling evaluation.completed event', { strategyId: eventData.strategy_id });

      // Log the evaluation completion event
      await this.strategyRepository.logEvent(eventData.strategy_id, 'evaluation.completed', {
        strategy_id: eventData.strategy_id,
        ai_score: eventData.ai_score,
        ai_recommendation: eventData.ai_recommendation,
        risk_level: eventData.risk_level,
        confidence: eventData.confidence,
        timestamp: new Date()
      });

      logger.info('Evaluation completion handled successfully', { strategyId: eventData.strategy_id });
    } catch (error) {
      logger.error('Error handling evaluation.completed event:', error);
    }
  }

  async stop(): Promise<void> {
    try {
      await messageBroker.disconnect();
      logger.info('Event consumer stopped successfully');
    } catch (error) {
      logger.error('Error stopping event consumer:', error);
    }
  }
}

// Singleton instance
export const eventConsumer = new EventConsumer(); 