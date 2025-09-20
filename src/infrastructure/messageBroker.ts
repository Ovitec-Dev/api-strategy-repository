import { rabbitMQConfig } from '@/config/rabbitmq';
import { logger } from '@/utils/logger';

export class MessageBroker {
  private static instance: MessageBroker;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): MessageBroker {
    if (!MessageBroker.instance) {
      MessageBroker.instance = new MessageBroker();
    }
    return MessageBroker.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await rabbitMQConfig.connect();
      this.isInitialized = true;
      logger.info('Message broker initialized successfully');
      
      // Set up event listeners
      rabbitMQConfig.on('connected', () => {
        logger.info('RabbitMQ connected');
      });
      
      rabbitMQConfig.on('max_reconnect_attempts_reached', () => {
        logger.error('Max reconnection attempts reached for RabbitMQ');
      });
      
    } catch (error) {
      logger.error('Error initializing message broker:', error);
      throw error;
    }
  }

  async publishEvent(eventType: string, data: any): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        throw new Error('Message broker not initialized');
      }

      const message = {
        event_id: this.generateEventId(),
        event_type,
        timestamp: new Date().toISOString(),
        data,
        metadata: {
          source: 'strategy-repository',
          version: '1.0.0'
        }
      };

      const success = await rabbitMQConfig.publishMessage(eventType, message);
      
      if (success) {
        logger.info(`Event published: ${eventType}`, { eventId: message.event_id });
      }
      
      return success;
    } catch (error) {
      logger.error('Error publishing event:', error);
      return false;
    }
  }

  async subscribeToEvent(eventType: string, callback: (data: any) => void): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('Message broker not initialized');
      }

      const queuePrefix = process.env.RABBITMQ_QUEUE_PREFIX || 'strategy_repository';
      const queueName = `${queuePrefix}_${eventType}`;

      // Bind queue to exchange
      await rabbitMQConfig.bindQueueToExchange(queueName, eventType);

      // Start consuming messages
      await rabbitMQConfig.consumeMessages(queueName, (message) => {
        try {
          const content = JSON.parse(message.content.toString());
          logger.info(`Event received: ${eventType}`, { eventId: content.event_id });
          callback(content);
        } catch (error) {
          logger.error('Error processing event:', error);
        }
      });

      logger.info(`Subscribed to event: ${eventType}`);
    } catch (error) {
      logger.error('Error subscribing to event:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await rabbitMQConfig.disconnect();
      this.isInitialized = false;
      logger.info('Message broker disconnected');
    } catch (error) {
      logger.error('Error disconnecting message broker:', error);
    }
  }

  isConnected(): boolean {
    return rabbitMQConfig.isConnected();
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const messageBroker = MessageBroker.getInstance(); 