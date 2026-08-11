import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { rabbitMQConfig } from '@/config/rabbitmq';

@Injectable()
export class MessageBrokerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessageBrokerService.name);
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) { }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async connect(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const url = this.configService.get<string>('rabbit.url');
      const exchange = this.configService.get<string>('rabbit.exchange');

      await rabbitMQConfig.connect({ url, exchange });
      this.isInitialized = true;
      this.logger.log('✅ RabbitMQ connected to ' + url);

      rabbitMQConfig.on('connected', () => this.logger.log('RabbitMQ reconnected'));
      rabbitMQConfig.on('max_reconnect_attempts_reached', () =>
        this.logger.error('Max reconnection attempts reached for RabbitMQ'),
      );
    } catch (error) {
      this.logger.error('Error initializing RabbitMQ:', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  async publishEvent(eventType: string, data: any): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        this.logger.warn('Message broker not initialized, attempting to connect...');
        await this.connect();
        if (!this.isInitialized) return false;
      }

      const message = {
        event_id: this.generateEventId(),
        event_type: eventType || 'unknown_event',
        timestamp: new Date().toISOString(),
        data,
        metadata: { source: 'strategy-repository', version: '1.0.0' },
      };

      const success = await rabbitMQConfig.publishMessage(eventType, message);
      if (success) {
        this.logger.log(`Event published: ${eventType} (id: ${message.event_id})`);
      }
      return success;
    } catch (error) {
      this.logger.error('Error publishing event:', error);
      return false;
    }
  }

  async subscribeToEvent(eventType: string, callback: (data: any) => void): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.connect();
      }

      const queuePrefix = this.configService.get<string>('rabbit.queuePrefix');
      const queueName = `${queuePrefix}_${eventType}`;

      await rabbitMQConfig.bindQueueToExchange(queueName, eventType);
      await rabbitMQConfig.consumeMessages(queueName, (message) => {
        try {
          const content = JSON.parse(message.content.toString());
          this.logger.log(`Event received: ${eventType} (id: ${content.event_id})`);
          callback(content);
        } catch (err) {
          this.logger.error('Error processing event:', err);
        }
      });

      this.logger.log(`Subscribed to: ${eventType}`);
    } catch (error) {
      this.logger.error('Error subscribing to event:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await rabbitMQConfig.disconnect();
      this.isInitialized = false;
      this.logger.log('RabbitMQ disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting RabbitMQ:', error);
    }
  }

  isConnected(): boolean {
    return rabbitMQConfig.isConnected();
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}