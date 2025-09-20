import { v4 as uuidv4 } from 'uuid';

export class UUIDGenerator {
  static generate(): string {
    return uuidv4();
  }

  static generateWithPrefix(prefix: string): string {
    return `${prefix}_${uuidv4()}`;
  }

  static isValid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static generateStrategyId(): string {
    return this.generateWithPrefix('strategy');
  }

  static generateEventId(): string {
    return this.generateWithPrefix('event');
  }

  static generateValidationId(): string {
    return this.generateWithPrefix('validation');
  }

  static generateBacktestId(): string {
    return this.generateWithPrefix('backtest');
  }
} 