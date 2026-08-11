import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MessageBrokerService } from '@shared/messaging/messaging.service';
import { StrategyRepository } from './repositories/strategy.repository';
import { ValidationResultDto, BacktestResultDto } from '@/dtos/ValidationResultDto';

@Injectable()
export class EventConsumerService implements OnModuleInit {
  private readonly logger = new Logger(EventConsumerService.name);

  constructor(
    private readonly messageBroker: MessageBrokerService,
    private readonly strategyRepository: StrategyRepository,
  ) { }

  async onModuleInit(): Promise<void> {
    await this.messageBroker.connect();
    await this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.messageBroker.subscribeToEvent('strategy.validated', this.handleStrategyValidated.bind(this));
      await this.messageBroker.subscribeToEvent('strategy.invalidated', this.handleStrategyInvalidated.bind(this));
      await this.messageBroker.subscribeToEvent('backtest.completed', this.handleBacktestCompleted.bind(this));
      await this.messageBroker.subscribeToEvent('strategy.failed', this.handleStrategyFailed.bind(this));
      await this.messageBroker.subscribeToEvent('backtest.failed', this.handleBacktestFailed.bind(this));
      await this.messageBroker.subscribeToEvent('evaluation.completed', this.handleEvaluationCompleted.bind(this));

      this.logger.log('✅ Event consumer initialized — listening on all strategy queues');
    } catch (error) {
      this.logger.error('Error initializing event consumer:', error);
      throw error;
    }
  }

  private async handleStrategyValidated(message: any): Promise<void> {
    try {
      const eventData = message.data;
      const validationResult: ValidationResultDto = {
        strategy_id: eventData.strategy_id,
        is_valid: true,
        validation_messages: eventData.validation_messages || [],
        risk_assessment: eventData.risk_assessment || {},
        validated_at: new Date(),
      };
      await this.strategyRepository.handleValidationResult(validationResult);
      this.logger.log(`strategy.validated handled for ${eventData.strategy_id}`);
    } catch (error) {
      this.logger.error('Error handling strategy.validated:', error);
    }
  }

  private async handleStrategyInvalidated(message: any): Promise<void> {
    try {
      const eventData = message.data;
      const validationResult: ValidationResultDto = {
        strategy_id: eventData.strategy_id,
        is_valid: false,
        validation_messages: eventData.validation_messages || [],
        risk_assessment: eventData.risk_assessment || {},
        validated_at: new Date(),
      };
      await this.strategyRepository.handleValidationResult(validationResult);
      this.logger.log(`strategy.invalidated handled for ${eventData.strategy_id}`);
    } catch (error) {
      this.logger.error('Error handling strategy.invalidated:', error);
    }
  }

  private async handleBacktestCompleted(message: any): Promise<void> {
    try {
      const eventData = message.data;
      const backtestResult: BacktestResultDto = {
        strategy_id: eventData.strategy_id,
        user_id: eventData.user_id,
        performance_metrics: eventData.performance_metrics || {},
        trade_log: eventData.trade_log || [],
        tested_at: new Date(),
      };
      await this.strategyRepository.handleBacktestResult(backtestResult);
      this.logger.log(`backtest.completed handled for ${eventData.strategy_id}`);
    } catch (error) {
      this.logger.error('Error handling backtest.completed:', error);
    }
  }

  private async handleStrategyFailed(message: any): Promise<void> {
    try {
      const eventData = message.data;
      await this.strategyRepository.updateStrategyStatus(eventData.strategy_id, 'failed');
      await this.strategyRepository.logEvent(eventData.strategy_id, 'strategy.failed', {
        strategy_id: eventData.strategy_id,
        error: eventData.error,
        timestamp: new Date(),
      });
      this.logger.log(`strategy.failed handled for ${eventData.strategy_id}`);
    } catch (error) {
      this.logger.error('Error handling strategy.failed:', error);
    }
  }

  private async handleBacktestFailed(message: any): Promise<void> {
    try {
      const eventData = message.data;
      await this.strategyRepository.updateStrategyStatus(eventData.strategy_id, 'failed');
      await this.strategyRepository.logEvent(eventData.strategy_id, 'backtest.failed', {
        strategy_id: eventData.strategy_id,
        error: eventData.error,
        timestamp: new Date(),
      });
      this.logger.log(`backtest.failed handled for ${eventData.strategy_id}`);
    } catch (error) {
      this.logger.error('Error handling backtest.failed:', error);
    }
  }

  private async handleEvaluationCompleted(message: any): Promise<void> {
    try {
      const eventData = message.data;
      await this.strategyRepository.logEvent(eventData.strategy_id, 'evaluation.completed', {
        strategy_id: eventData.strategy_id,
        ai_score: eventData.ai_score,
        ai_recommendation: eventData.ai_recommendation,
        risk_level: eventData.risk_level,
        confidence: eventData.confidence,
        timestamp: new Date(),
      });
      this.logger.log(`evaluation.completed handled for ${eventData.strategy_id}`);
    } catch (error) {
      this.logger.error('Error handling evaluation.completed:', error);
    }
  }
}