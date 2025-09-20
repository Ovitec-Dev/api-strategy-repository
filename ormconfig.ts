import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/entities/User';
import { Strategy } from './src/entities/Strategy';
import { Grade } from './src/entities/Grade';
import { Rule } from './src/entities/Rule';
import { StrategyRule } from './src/entities/StrategyRule';
import { Validation } from './src/entities/Validation';
import { BacktestResult } from './src/entities/BacktestResult';
import { EventLog } from './src/entities/EventLog';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'strategy_repository',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Strategy, Grade, Rule, StrategyRule, Validation, BacktestResult, EventLog],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});

export default AppDataSource; 