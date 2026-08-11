import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreatePortfolioDto, IUpdatePortfolioDto } from '@shared/interfaces';
import { BudgetPeriod } from '../entities/budget.entity';

export class CreatePortfolioDto implements ICreatePortfolioDto {
    @ApiProperty({ example: 'My Portfolio', description: 'Nombre del portafolio' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'Trading and investment portfolio', description: 'Descripción opcional' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'USD', default: 'USD', description: 'Moneda base' })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional({ default: false, description: 'Si es el portafolio por defecto' })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}

export class UpdatePortfolioDto implements IUpdatePortfolioDto {
    @ApiPropertyOptional({ example: 'Main Portfolio' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 'Updated description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'EUR' })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}

export class UpdateBudgetDto {
    @ApiPropertyOptional({ example: 'Groceries budget' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 500, description: 'Monto del presupuesto' })
    @IsOptional()
    @IsNumber()
    amount?: number;

    @ApiPropertyOptional({ example: 'USD' })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional({ enum: BudgetPeriod, example: BudgetPeriod.MONTHLY })
    @IsOptional()
    @IsEnum(BudgetPeriod)
    period?: BudgetPeriod;

    @ApiPropertyOptional({ example: '2026-08-01' })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startDate?: Date;

    @ApiPropertyOptional({ example: '2026-12-31' })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endDate?: Date;
}
