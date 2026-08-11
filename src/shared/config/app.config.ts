import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'strategy_repository',
    synchronize: false,
    logging: false,
}));

export const jwtConfig = registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here',
    refreshExpirationDays: parseInt(process.env.REFRESH_TOKEN_DAYS || '7', 10),
}));

export const rabbitConfig = registerAs('rabbit', () => ({
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'trading_events',
    queuePrefix: process.env.RABBITMQ_QUEUE_PREFIX || 'strategy_repository',
}));

export const appConfig = registerAs('app', () => ({
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
}));
