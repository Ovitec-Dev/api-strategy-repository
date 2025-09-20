import { AppDataSource } from '../../ormconfig';
import { logger } from '@/utils/logger';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await AppDataSource.initialize();
      this.isInitialized = true;
      logger.info('Database connection established successfully');
      
      // Log database info
      const connection = AppDataSource;
      logger.info(`Database: ${connection.options.database}`);
      logger.info(`Host: ${connection.options.host}:${connection.options.port}`);
      
    } catch (error) {
      logger.error('Error connecting to database:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      this.isInitialized = false;
      logger.info('Database connection closed');
    }
  }

  getDataSource() {
    return AppDataSource;
  }

  isConnected(): boolean {
    return AppDataSource.isInitialized;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!AppDataSource.isInitialized) {
        return false;
      }
      
      // Simple query to check connection
      await AppDataSource.query('SELECT 1');
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

export const databaseConnection = DatabaseConnection.getInstance(); 