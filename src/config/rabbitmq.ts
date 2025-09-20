import amqp, { Connection, Channel, Message } from 'amqplib';
import { EventEmitter } from 'events';

export class RabbitMQConfig extends EventEmitter {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;

  constructor() {
    super();
  }

  async connect(): Promise<void> {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
      this.connection = await amqp.connect(url);
      
      this.connection.on('error', (error) => {
        console.error('RabbitMQ connection error:', error);
        this.handleReconnect();
      });

      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
        this.handleReconnect();
      });

      this.channel = await this.connection.createChannel();
      
      // Declare exchange
      const exchangeName = process.env.RABBITMQ_EXCHANGE || 'trading_events';
      await this.channel.assertExchange(exchangeName, 'topic', { durable: true });
      
      console.log('RabbitMQ connected successfully');
      this.reconnectAttempts = 0;
      this.emit('connected');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      this.handleReconnect();
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

      const exchangeName = process.env.RABBITMQ_EXCHANGE || 'trading_events';
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

      if (result) {
        console.log(`Message published to ${routingKey}:`, message);
      }

      return result;
    } catch (error) {
      console.error('Failed to publish message:', error);
      return false;
    }
  }

  async consumeMessages(queueName: string, callback: (message: Message) => void): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      // Declare queue
      await this.channel.assertQueue(queueName, { durable: true });
      
      // Consume messages
      await this.channel.consume(queueName, (message) => {
        if (message) {
          try {
            const content = JSON.parse(message.content.toString());
            console.log(`Message received from ${queueName}:`, content);
            
            callback(message);
            
            // Acknowledge message
            this.channel?.ack(message);
          } catch (error) {
            console.error('Error processing message:', error);
            // Reject message and requeue
            this.channel?.nack(message, false, true);
          }
        }
      });

      console.log(`Started consuming messages from ${queueName}`);
    } catch (error) {
      console.error('Failed to consume messages:', error);
    }
  }

  async bindQueueToExchange(queueName: string, routingKey: string): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      const exchangeName = process.env.RABBITMQ_EXCHANGE || 'trading_events';
      
      // Declare queue
      await this.channel.assertQueue(queueName, { durable: true });
      
      // Bind queue to exchange
      await this.channel.bindQueue(queueName, exchangeName, routingKey);
      
      console.log(`Queue ${queueName} bound to exchange ${exchangeName} with routing key ${routingKey}`);
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
        await this.connection.close();
        this.connection = null;
      }
      
      console.log('RabbitMQ disconnected');
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

// Singleton instance
export const rabbitMQConfig = new RabbitMQConfig(); 