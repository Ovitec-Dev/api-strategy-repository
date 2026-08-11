import { IsString, IsOptional, IsUUID, IsArray, ValidateNested, MinLength, MaxLength, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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