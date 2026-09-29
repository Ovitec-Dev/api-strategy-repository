import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { EventConsumerService } from '../event-consumer.service';
import { MessageBrokerService } from '@shared/messaging/messaging.service';
import { StrategyRepository } from '../repositories/strategy.repository';

describe('EventConsumerService', () => {
  let service: EventConsumerService;
  let repo: jest.Mocked<StrategyRepository>;
  let broker: jest.Mocked<MessageBrokerService>;

  const makeMessage = (event_id: string, event_type: string, data: Record<string, any>, metadata = {}) => ({
    event_id,
    event_type,
    timestamp: new Date().toISOString(),
    data,
    metadata: { source: 'test', ...metadata },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventConsumerService,
        {
          provide: MessageBrokerService,
          useValue: {
            connect: jest.fn(),
            subscribeToEvent: jest.fn(),
            isConnected: jest.fn().mockReturnValue(false),
          },
        },
        {
          provide: StrategyRepository,
          useValue: {
            isEventProcessed: jest.fn().mockResolvedValue(false),
            markEventProcessed: jest.fn().mockResolvedValue(undefined),
            handleValidationResult: jest.fn().mockResolvedValue(undefined),
            handleBacktestResult: jest.fn().mockResolvedValue(undefined),
            updateStrategyStatus: jest.fn().mockResolvedValue(undefined),
            logEvent: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<EventConsumerService>(EventConsumerService);
    repo = module.get(StrategyRepository) as jest.Mocked<StrategyRepository>;
    broker = module.get(MessageBrokerService) as jest.Mocked<MessageBrokerService>;

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  describe('dedup guard', () => {
    it('skips processing when event_id was already processed', async () => {
      repo.isEventProcessed.mockResolvedValue(true);
      const msg = makeMessage('evt-1', 'strategy.validated', { strategy_id: 's-1' });
      await (service as any).handleStrategyValidated(msg);
      expect(repo.handleValidationResult).not.toHaveBeenCalled();
      expect(repo.markEventProcessed).not.toHaveBeenCalled();
    });

    it('processes event when event_id is new', async () => {
      repo.isEventProcessed.mockResolvedValue(false);
      const msg = makeMessage('evt-1', 'strategy.validated', { strategy_id: 's-1' });
      await (service as any).handleStrategyValidated(msg);
      expect(repo.handleValidationResult).toHaveBeenCalled();
      expect(repo.markEventProcessed).toHaveBeenCalledWith('evt-1', 'strategy.validated');
    });
  });

  describe('handleStrategyValidated', () => {
    it('reads strategy_id from data root (FR-NEST-02)', async () => {
      const msg = makeMessage('evt-v1', 'strategy.validated', {
        strategy_id: 'uuid-1',
        validation_messages: ['all good'],
        risk_assessment: { risk_score: 0.3 },
      });
      await (service as any).handleStrategyValidated(msg);
      expect(repo.handleValidationResult).toHaveBeenCalledWith(
        expect.objectContaining({ strategy_id: 'uuid-1', is_valid: true }),
      );
    });
  });

  describe('handleStrategyInvalidated (FR-NEST-03)', () => {
    it('sets is_valid false and processes the event', async () => {
      const msg = makeMessage('evt-inv1', 'strategy.invalidated', {
        strategy_id: 'uuid-2',
        validation_messages: ['rule missing'],
        risk_assessment: { risk_score: 0.9 },
      });
      await (service as any).handleStrategyInvalidated(msg);
      expect(repo.handleValidationResult).toHaveBeenCalledWith(
        expect.objectContaining({ strategy_id: 'uuid-2', is_valid: false }),
      );
      expect(repo.markEventProcessed).toHaveBeenCalledWith('evt-inv1', 'strategy.invalidated');
    });
  });

  describe('handleBacktestCompleted (FR-NEST-04)', () => {
    it('reads performance_metrics as nested object and user_id from root', async () => {
      const msg = makeMessage('evt-bt1', 'backtest.completed', {
        strategy_id: 'uuid-3',
        user_id: 'user-1',
        performance_metrics: { total_return: 0.15, sharpe_ratio: 1.5, max_drawdown: 0.08, win_rate: 0.65, total_trades: 100, profitable_trades: 65 },
        trade_log: [{ trade: 1 }],
      });
      await (service as any).handleBacktestCompleted(msg);
      expect(repo.handleBacktestResult).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy_id: 'uuid-3',
          user_id: 'user-1',
          performance_metrics: expect.objectContaining({ total_return: 0.15, sharpe_ratio: 1.5 }),
          trade_log: [{ trade: 1 }],
        }),
      );
    });
  });

  describe('handleBacktestFailed (FR-NEST-05)', () => {
    it('updates strategy status to FAILED and logs the error', async () => {
      const msg = makeMessage('evt-btf1', 'backtest.failed', {
        strategy_id: 'uuid-4',
        error: 'Data source unavailable',
      });
      await (service as any).handleBacktestFailed(msg);
      expect(repo.updateStrategyStatus).toHaveBeenCalledWith('uuid-4', 'FAILED');
      expect(repo.logEvent).toHaveBeenCalledWith(
        'uuid-4',
        'backtest.failed',
        expect.objectContaining({ error: 'Data source unavailable' }),
      );
      expect(repo.markEventProcessed).toHaveBeenCalledWith('evt-btf1', 'backtest.failed');
    });
  });

  describe('handleEvaluationCompleted (FR-NEST-07)', () => {
    it('reads strategy_id from data root and sets EVALUATED status', async () => {
      const msg = makeMessage('evt-ev1', 'evaluation.completed', {
        strategy_id: 'uuid-5',
        ai_score: 0.78,
        ai_recommendation: 'Deploy',
        risk_level: 'MEDIO',
        confidence: 0.85,
      });
      await (service as any).handleEvaluationCompleted(msg);
      expect(repo.updateStrategyStatus).toHaveBeenCalledWith('uuid-5', 'EVALUATED');
      expect(repo.logEvent).toHaveBeenCalledWith(
        'uuid-5',
        'evaluation.completed',
        expect.objectContaining({ ai_score: 0.78 }),
      );
      expect(repo.markEventProcessed).toHaveBeenCalledWith('evt-ev1', 'evaluation.completed');
    });
  });

  describe('handleEvaluationSkipped (FR-NEST-08)', () => {
    it('sets SKIPPED status and logs the event', async () => {
      const msg = makeMessage('evt-skip1', 'evaluation.skipped', {
        strategy_id: 'uuid-6',
        reason: 'Insufficient backtest data',
      });
      await (service as any).handleEvaluationSkipped(msg);
      expect(repo.updateStrategyStatus).toHaveBeenCalledWith('uuid-6', 'SKIPPED');
      expect(repo.logEvent).toHaveBeenCalledWith(
        'uuid-6',
        'evaluation.skipped',
        expect.objectContaining({ reason: 'Insufficient backtest data' }),
      );
      expect(repo.markEventProcessed).toHaveBeenCalledWith('evt-skip1', 'evaluation.skipped');
    });

    it('uses default reason when not provided', async () => {
      const msg = makeMessage('evt-skip2', 'evaluation.skipped', {
        strategy_id: 'uuid-7',
      });
      await (service as any).handleEvaluationSkipped(msg);
      expect(repo.logEvent).toHaveBeenCalledWith(
        'uuid-7',
        'evaluation.skipped',
        expect.objectContaining({ reason: 'Evaluation skipped by pipeline' }),
      );
    });
  });

  describe('schema_version mismatch logging (NFR-NEST-02)', () => {
    it('logs a warning when schema_version is present and not "1"', async () => {
      const msg = makeMessage('evt-warn1', 'strategy.validated', { strategy_id: 's-1' }, { schema_version: '2' });
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');
      await (service as any).handleStrategyValidated(msg);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Schema version mismatch'));
    });
  });
});
