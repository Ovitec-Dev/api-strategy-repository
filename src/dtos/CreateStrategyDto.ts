import { IsString, IsOptional, IsUUID, IsArray, ValidateNested, MinLength, MaxLength, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum StrategyTypeInput {
  MOVING_AVERAGE = 'moving_average',
  RSI = 'rsi',
  MACD = 'macd',
  BOLLINGER_BANDS = 'bollinger_bands',
  CUSTOM = 'custom',
}

export enum MarketTypeInput {
  STOCKS = 'stocks',
  FOREX = 'forex',
  CRYPTO = 'crypto',
  COMMODITIES = 'commodities',
}

export class RuleInputDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID de la regla' })
  @IsUUID('4', { message: 'El rule_id debe ser un UUID válido' })
  rule_id: string;

  @ApiPropertyOptional({ example: { period: 14, oversold: 30 }, description: 'Parámetros de la regla' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}

export class CreateStrategyDto {
  @ApiProperty({ example: 'RSI Strategy', description: 'Nombre de la estrategia', minLength: 1, maxLength: 255 })
  @IsString()
  @MinLength(1, { message: 'El nombre es requerido' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @ApiPropertyOptional({ example: 'Estrategia basada en RSI', description: 'Descripción de la estrategia' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID del usuario' })
  @IsUUID('4', { message: 'El user_id debe ser un UUID válido' })
  user_id: string;

  @ApiPropertyOptional({ enum: StrategyTypeInput, example: StrategyTypeInput.RSI, description: 'Tipo de estrategia (consumido por Python)' })
  @IsOptional()
  @IsEnum(StrategyTypeInput)
  strategy_type?: StrategyTypeInput;

  @ApiPropertyOptional({ enum: MarketTypeInput, example: MarketTypeInput.CRYPTO, description: 'Tipo de mercado' })
  @IsOptional()
  @IsEnum(MarketTypeInput)
  market?: MarketTypeInput;

  @ApiPropertyOptional({ example: 'BTCUSDT', description: 'Símbolo del instrumento' })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({ example: '1h', description: 'Timeframe (1m, 5m, 15m, 1h, 4h, 1d)' })
  @IsOptional()
  @IsString()
  timeframe?: string;

  @ApiPropertyOptional({ example: { short_period: 10, long_period: 30 }, description: 'Parámetros de la estrategia (consumidos por Python)' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({ type: [RuleInputDto], description: 'Lista de reglas asociadas' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleInputDto)
  rules?: RuleInputDto[];

  @ApiPropertyOptional({ example: { source: 'manual' }, description: 'Metadata adicional' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateStrategyDto {
  @ApiPropertyOptional({ example: 'Updated Strategy Name', minLength: 1, maxLength: 255 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'validated', enum: ['pending', 'parsed', 'validated', 'invalid', 'tested', 'failed'] })
  @IsOptional()
  @IsEnum(['pending', 'parsed', 'validated', 'invalid', 'tested', 'failed'])
  status?: string;

  @ApiPropertyOptional({ type: [RuleInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleInputDto)
  rules?: RuleInputDto[];

  @ApiPropertyOptional({ example: { source: 'manual' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}