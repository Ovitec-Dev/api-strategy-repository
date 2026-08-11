import * as amqp from 'amqplib';
import { EventEmitter } from 'events';

export interface RabbitMQOptions {
  url?: string;
  exchange?: string;
}

export class RabbitMQConfig extends EventEmitter {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 20;
  private reconnectDelay = 5000;
  private options: RabbitMQOptions = {};

  constructor() {
    super();
  }

  async connect(options: RabbitMQOptions = {}): Promise<void> {
    this.options = { ...this.options, ...options };
    try {
      const url = this.options.url || process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
      const conn = await amqp.connect(url);
      this.connection = conn as unknown as amqp.Connection;

      this.connection.on('error', (error: any) => {
        console.error('RabbitMQ connection error:', error);
        this.handleReconnect();
      });

      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
        this.handleReconnect();
      });

      this.channel = await (this.connection as any).createChannel();

      const exchangeName = this.options.exchange || process.env.RABBITMQ_EXCHANGE || 'trading_events';
      if (this.channel) {
        await this.channel.assertExchange(exchangeName, 'topic', { durable: true });
      }

      console.log('RabbitMQ connected successfully');
      this.reconnectAttempts = 0;
      this.emit('connected');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      this.handleReconnect();
      throw error;
    }
  }

  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect to RabbitMQ (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }, this.reconnectDelay);
  }

  async publishMessage(routingKey: string, message: any): Promise<boolean> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      const exchangeName = this.options.exchange || process.env.RABBITMQ_EXCHANGE || 'trading_events';
      const messageBuffer = Buffer.from(JSON.stringify(message));

      const result = this.channel.publish(
        exchangeName,
        routingKey,
        messageBuffer,
        {
          persistent: true,
          timestamp: Date.now()
        }
      );

      return result;
    } catch (error) {
      console.error('Failed to publish message:', error);
      return false;
    }
  }

  async consumeMessages(queueName: string, callback: (message: amqp.Message) => void): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      await this.channel.assertQueue(queueName, { durable: true });

      await this.channel.consume(queueName, (message: amqp.Message | null) => {
        if (message) {
          try {
            callback(message);
            this.channel?.ack(message);
          } catch (error) {
            console.error('Error processing message:', error);
            this.channel?.nack(message, false, true);
          }
        }
      });
    } catch (error) {
      console.error('Failed to consume messages:', error);
    }
  }

  async bindQueueToExchange(queueName: string, routingKey: string): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      const exchangeName = this.options.exchange || process.env.RABBITMQ_EXCHANGE || 'trading_events';
      await this.channel.assertQueue(queueName, { durable: true });
      await this.channel.bindQueue(queueName, exchangeName, routingKey);
    } catch (error) {
      console.error('Failed to bind queue to exchange:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await (this.connection as any).close();
        this.connection = null;
      }
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

export const rabbitMQConfig = new RabbitMQConfig();