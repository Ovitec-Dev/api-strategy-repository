import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Strategy } from './entities/strategy.entity';
import { StrategySchedule } from './entities/strategy-schedule.entity';
import { StrategyExecution } from './entities/strategy-execution.entity';
import { StrategyRule } from './entities/strategy-rule.entity';
import { BacktestResult } from './entities/backtest-result.entity';
import { EventLog } from './entities/event-log.entity';
import { Rule } from './entities/rule.entity';
import { Validation } from './entities/validation.entity';
import { ProcessedEvent } from './entities/processed-event.entity';
import { StrategyController } from './strategy.controller';
import { StrategyService } from './strategy.service';
import { StrategySchedulerService } from './strategy-scheduler.service';
import { StrategyRepository } from './repositories/strategy.repository';
import { EventConsumerService } from './event-consumer.service';
import { OrderModule } from '../order/order.module';
import { MessagingModule } from '@shared/messaging/messaging.module';
import { Order } from '@modules/order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Strategy,
      StrategySchedule,
      StrategyExecution,
      StrategyRule,
      BacktestResult,
      EventLog,
      ProcessedEvent,
      Rule,
      Validation,
      Order
    ]),
    forwardRef(() => OrderModule),
    MessagingModule,
  ],
  controllers: [StrategyController],
  providers: [StrategyService, StrategySchedulerService, StrategyRepository, EventConsumerService],
  exports: [StrategyService, StrategyRepository],
})
export class StrategyModule { }
