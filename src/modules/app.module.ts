import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { databaseConfig, jwtConfig, rabbitConfig, appConfig } from '@shared/config';
import { DatabaseModule } from '@shared/database/database.module';
import { MessagingModule } from '@shared/messaging/messaging.module';
import { AutoMapperModule } from './auto-mapper/auto-mapper.module';
import { StrategyModule } from './strategy/strategy.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { TransactionModule } from './transaction/transaction.module';
import { HealthModule } from './health/health.module';
import { LoggingModule } from '@shared/logging/logging.module';

@Module({
  imports: [
    // Load .env globally + registered configs
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, rabbitConfig, appConfig],
    }),
    // Enable task scheduling
    ScheduleModule.forRoot(),

    DatabaseModule,
    MessagingModule,
    AutoMapperModule,

    // Core Modules
    AuthModule,
    UsersModule,
    PortfolioModule,
    CategoryModule,
    OrderModule,
    TransactionModule,
    StrategyModule,
    HealthModule,
    LoggingModule,
  ],
})
export class AppModule { }