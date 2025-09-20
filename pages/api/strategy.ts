import { NextApiRequest, NextApiResponse } from 'next';
import { StrategyController } from '@/controllers/strategy.controller';
import { databaseConnection } from '@/infrastructure/database';
import { eventConsumer } from '@/consumers/EventConsumer';
import { logger } from '@/utils/logger';

// Initialize database and event consumer
let isInitialized = false;

async function initializeServices() {
  if (!isInitialized) {
    try {
      await databaseConnection.initialize();
      await eventConsumer.initialize();
      isInitialized = true;
      logger.info('Services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize services:', error);
      throw error;
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Initialize services if not already done
    await initializeServices();

    const controller = new StrategyController();
    const { method, query } = req;

    // Route handling based on method and query parameters
    if (method === 'POST' && !query.id) {
      // Create strategy
      await controller.createStrategy(req, res);
    } else if (method === 'GET' && query.id && !query.metrics && !query.status) {
      // Get strategy by ID
      await controller.getStrategyById(req, res);
    } else if (method === 'GET' && query.user_id) {
      // Get strategies by user ID
      await controller.getStrategiesByUserId(req, res);
    } else if (method === 'PUT' && query.id) {
      // Update strategy
      await controller.updateStrategy(req, res);
    } else if (method === 'DELETE' && query.id) {
      // Delete strategy
      await controller.deleteStrategy(req, res);
    } else if (method === 'GET' && query.id && query.metrics) {
      // Get strategy metrics
      await controller.getStrategyMetrics(req, res);
    } else if (method === 'GET' && query.strategy_id && query.logs) {
      // Get event logs
      await controller.getEventLogs(req, res);
    } else if (method === 'POST' && query.validate) {
      // Validate strategy
      await controller.validateStrategy(req, res);
    } else if (method === 'GET' && query.id && query.status) {
      // Get strategy status
      await controller.getStrategyStatus(req, res);
    } else {
      res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    logger.error('Error in strategy API handler:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  try {
    await eventConsumer.stop();
    await databaseConnection.close();
    logger.info('Services shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  try {
    await eventConsumer.stop();
    await databaseConnection.close();
    logger.info('Services shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}); 