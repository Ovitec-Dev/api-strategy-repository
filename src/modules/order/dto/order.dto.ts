import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType } from '@shared/types';
import { ICreateOrderDto } from '@shared/interfaces';

export class CreateOrderDto implements ICreateOrderDto {
    @ApiPropertyOptional({ description: 'UUID del portafolio' })
    @IsOptional()
    @IsUUID()
    portfolio_id?: string;

    @ApiPropertyOptional({ description: 'UUID de la estrategia' })
    @IsOptional()
    @IsUUID()
    strategy_id?: string;

    @ApiPropertyOptional({ example: 'REF-123' })
    @IsOptional()
    @IsString()
    externalRef?: string;

    @ApiProperty({ enum: OrderType, example: OrderType.BUY })
    @IsEnum(OrderType)
    type: OrderType | string;

    @ApiProperty({ example: 'BTC' })
    @IsString()
    asset: string;

    @ApiProperty({ example: 0.5 })
    @IsNumber()
    amount: number;

    @ApiProperty({ example: 'USD' })
    @IsString()
    currency: string;

    @ApiPropertyOptional({ example: { source: 'api' } })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}
