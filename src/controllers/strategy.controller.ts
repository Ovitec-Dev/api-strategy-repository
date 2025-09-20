import { NextApiRequest, NextApiResponse } from 'next';
import { StrategyService } from '@/services/StrategyService';
import { CreateStrategySchema, UpdateStrategySchema } from '@/dtos/CreateStrategyDto';
import { logger } from '@/utils/logger';

export class StrategyController {
  private strategyService: StrategyService;

  constructor() {
    this.strategyService = new StrategyService();
  }

  async createStrategy(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      // Validate request body
      const validationResult = CreateStrategySchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation error',
          details: validationResult.error.errors
        });
        return;
      }

      const dto = validationResult.data;
      const result = await this.strategyService.createStrategy(dto);

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error in createStrategy controller:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create strategy'
      });
    }
  }

  async getStrategyById(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Strategy ID is required' });
        return;
      }

      const result = await this.strategyService.getStrategyById(id);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in getStrategyById controller:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get strategy'
      });
    }
  }

  async getStrategiesByUserId(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { user_id, limit, offset } = req.query;
      if (!user_id || typeof user_id !== 'string') {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const limitNum = limit ? parseInt(limit as string) : 10;
      const offsetNum = offset ? parseInt(offset as string) : 0;

      const result = await this.strategyService.getStrategiesByUserId(user_id, limitNum, offsetNum);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in getStrategiesByUserId controller:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get strategies'
      });
    }
  }

  async updateStrategy(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      if (req.method !== 'PUT') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Strategy ID is required' });
        return;
      }

      // Validate request body
      const validationResult = UpdateStrategySchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation error',
          details: validationResult.error.errors
        });
        return;
      }

      const dto = validationResult.data;
      const result = await this.strategyService.updateStrategy(id, dto);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in updateStrategy controller:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update strategy'
      });
    }
  }

  async deleteStrategy(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      if (req.method !== 'DELETE') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Strategy ID is required' });
        return;
      }

      const result = await this.strategyService.deleteStrategy(id);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in deleteStrategy controller:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete strategy'
      });
    }
  }

  async getStrategyMetrics(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Strategy ID is required' });
        return;
      }

      const result = await this.strategyService.getStrategyMetrics(id);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in getStrategyMetrics controller:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get strategy metrics'
      });
    }
  }

  async getEventLogs(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { strategy_id, limit } = req.query;
      if (!strategy_id || typeof strategy_id !== 'string') {
        res.status(400).json({ error: 'Strategy ID is required' });
        return;
      }

      const limitNum = limit ? parseInt(limit as string) : 50;
      const result = await this.strategyService.getEventLogs(strategy_id, limitNum);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in getEventLogs controller:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get event logs'
      });
    }
  }

  async validateStrategy(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      // Validate request body
      const validationResult = CreateStrategySchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation error',
          details: validationResult.error.errors
        });
        return;
      }

      const dto = validationResult.data;
      const result = await this.strategyService.validateStrategy(dto);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in validateStrategy controller:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to validate strategy'
      });
    }
  }

  async getStrategyStatus(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Strategy ID is required' });
        return;
      }

      const result = await this.strategyService.getStrategyStatus(id);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in getStrategyStatus controller:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get strategy status'
      });
    }
  }
} 