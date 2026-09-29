import { IsBoolean, IsOptional, IsUUID, IsArray, IsNumber, IsString, ValidateNested, IsObject, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidationResultDto {
  @ApiProperty({ description: 'UUID de la estrategia validada' })
  @IsUUID()
  strategy_id: string;

  @ApiProperty({ description: 'Si la estrategia es válida' })
  @IsBoolean()
  is_valid: boolean;

  @ApiPropertyOptional({ description: 'Mensajes de validación', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  validation_messages?: string[];

  @ApiPropertyOptional({ description: 'Evaluación de riesgo' })
  @IsOptional()
  @IsObject()
  risk_assessment?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Fecha de validación' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  validated_at?: Date;
}

export class PerformanceMetricsDto {
  @ApiProperty({ example: 0.15 })
  @IsNumber()
  total_return: number;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  sharpe_ratio: number;

  @ApiProperty({ example: 0.08, description: 'Positive fraction (absolute value of max drawdown)' })
  @IsNumber()
  @Min(0)
  max_drawdown: number;

  @ApiProperty({ example: 0.65 })
  @IsNumber()
  win_rate: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  total_trades: number;

  @ApiProperty({ example: 65 })
  @IsNumber()
  profitable_trades: number;
}

export class BacktestResultDto {
  @ApiProperty({ description: 'UUID de la estrategia' })
  @IsUUID()
  strategy_id: string;

  @ApiProperty({ description: 'UUID del usuario' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ type: PerformanceMetricsDto, description: 'Métricas de performance' })
  @ValidateNested()
  @Type(() => PerformanceMetricsDto)
  performance_metrics: PerformanceMetricsDto;

  @ApiProperty({ description: 'Log de trades ejecutados' })
  @IsArray()
  trade_log: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Fecha del backtest' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  tested_at?: Date;
}

export class EventMessageDto {
  @ApiProperty({ description: 'UUID del evento' })
  @IsUUID()
  event_id: string;

  @ApiProperty({ description: 'Tipo de evento' })
  @IsString()
  event_type: string;

  @ApiProperty({ description: 'Timestamp' })
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @ApiProperty({ description: 'Datos del evento' })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({ description: 'Metadata adicional' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}