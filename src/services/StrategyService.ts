import { StrategyRepository } from '@/repositories/StrategyRepository';
import { CreateStrategyDto, UpdateStrategyDto } from '@/dtos/CreateStrategyDto';
import { StrategyMapper } from '@/mappers/strategy.mapper';
import { logger } from '@/utils/logger';

export class StrategyService {
  private strategyRepository: StrategyRepository;

  constructor() {
    this.strategyRepository = new StrategyRepository();
  }

  async createStrategy(dto: CreateStrategyDto): Promise<any> {
    try {
      logger.info('Creating strategy', { name: dto.name, userId: dto.user_id });

      const strategy = await this.strategyRepository.createStrategy(dto);
      const strategyDto = StrategyMapper.toDto(strategy);

      logger.info('Strategy created successfully', { strategyId: strategy.id });

      return {
        success: true,
        data: strategyDto,
        message: 'Strategy created successfully'
      };
    } catch (error) {
      logger.error('Error creating strategy:', error);
      throw error;
    }
  }

  async getStrategyById(id: string): Promise<any> {
    try {
      logger.info('Getting strategy by ID', { strategyId: id });

      const strategy = await this.strategyRepository.getStrategyById(id);
      
      if (!strategy) {
        return {
          success: false,
          message: 'Strategy not found'
        };
      }

      const strategyDto = StrategyMapper.toDto(strategy);

      return {
        success: true,
        data: strategyDto
      };
    } catch (error) {
      logger.error('Error getting strategy by ID:', error);
      throw error;
    }
  }

  async getStrategiesByUserId(userId: string, limit = 10, offset = 0): Promise<any> {
    try {
      logger.info('Getting strategies by user ID', { userId, limit, offset });

      const strategies = await this.strategyRepository.getStrategiesByUserId(userId, limit, offset);
      const strategiesDto = strategies.map(strategy => StrategyMapper.toDto(strategy));

      return {
        success: true,
        data: strategiesDto,
        pagination: {
          limit,
          offset,
          total: strategies.length
        }
      };
    } catch (error) {
      logger.error('Error getting strategies by user ID:', error);
      throw error;
    }
  }

  async updateStrategy(id: string, dto: UpdateStrategyDto): Promise<any> {
    try {
      logger.info('Updating strategy', { strategyId: id });

      const updatedStrategy = await this.strategyRepository.updateStrategy(id, dto);
      
      if (!updatedStrategy) {
        return {
          success: false,
          message: 'Strategy not found'
        };
      }

      const strategyDto = StrategyMapper.toDto(updatedStrategy);

      return {
        success: true,
        data: strategyDto,
        message: 'Strategy updated successfully'
      };
    } catch (error) {
      logger.error('Error updating strategy:', error);
      throw error;
    }
  }

  async deleteStrategy(id: string): Promise<any> {
    try {
      logger.info('Deleting strategy', { strategyId: id });

      const deleted = await this.strategyRepository.deleteStrategy(id);
      
      if (!deleted) {
        return {
          success: false,
          message: 'Strategy not found'
        };
      }

      return {
        success: true,
        message: 'Strategy deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting strategy:', error);
      throw error;
    }
  }

  async getStrategyMetrics(id: string): Promise<any> {
    try {
      logger.info('Getting strategy metrics', { strategyId: id });

      const metrics = await this.strategyRepository.getStrategyMetrics(id);
      
      if (!metrics) {
        return {
          success: false,
          message: 'Strategy not found'
        };
      }

      return {
        success: true,
        data: metrics
      };
    } catch (error) {
      logger.error('Error getting strategy metrics:', error);
      throw error;
    }
  }

  async getEventLogs(strategyId: string, limit = 50): Promise<any> {
    try {
      logger.info('Getting event logs', { strategyId, limit });

      const logs = await this.strategyRepository.getEventLogs(strategyId, limit);

      return {
        success: true,
        data: logs,
        pagination: {
          limit,
          total: logs.length
        }
      };
    } catch (error) {
      logger.error('Error getting event logs:', error);
      throw error;
    }
  }

  async validateStrategy(dto: CreateStrategyDto): Promise<any> {
    try {
      logger.info('Validating strategy', { name: dto.name });

      // Basic validation logic
      const validationErrors: string[] = [];
      
      if (!dto.name || dto.name.trim().length === 0) {
        validationErrors.push('Strategy name is required');
      }
      
      if (!dto.user_id) {
        validationErrors.push('User ID is required');
      }
      
      if (dto.rules && dto.rules.length === 0) {
        validationErrors.push('At least one rule is required');
      }

      const isValid = validationErrors.length === 0;

      return {
        success: true,
        data: {
          is_valid: isValid,
          validation_errors: validationErrors,
          validation_messages: validationErrors
        }
      };
    } catch (error) {
      logger.error('Error validating strategy:', error);
      throw error;
    }
  }

  async getStrategyStatus(id: string): Promise<any> {
    try {
      logger.info('Getting strategy status', { strategyId: id });

      const strategy = await this.strategyRepository.getStrategyById(id);
      
      if (!strategy) {
        return {
          success: false,
          message: 'Strategy not found'
        };
      }

      return {
        success: true,
        data: {
          strategy_id: id,
          status: strategy.status,
          created_at: strategy.created_at,
          updated_at: strategy.updated_at
        }
      };
    } catch (error) {
      logger.error('Error getting strategy status:', error);
      throw error;
    }
  }
} 