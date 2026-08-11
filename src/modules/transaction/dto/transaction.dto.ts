import { IsString, IsOptional, IsNumber, IsUUID, IsObject, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ICreateTransactionDto } from '@shared/interfaces';

export class CreateTransactionDto implements ICreateTransactionDto {
    @ApiProperty({ description: 'UUID del portafolio' })
    @IsUUID()
    portfolio_id: string;

    @ApiPropertyOptional({ description: 'UUID de la categoría' })
    @IsOptional()
    @IsUUID()
    category_id?: string;

    @ApiPropertyOptional({ description: 'UUID de la subcategoría' })
    @IsOptional()
    @IsUUID()
    sub_category_id?: string;

    @ApiPropertyOptional({ description: 'UUID de la orden relacionada' })
    @IsOptional()
    @IsUUID()
    order_id?: string;

    @ApiProperty({ example: 'INCOME' })
    @IsString()
    type: string;

    @ApiProperty({ example: 1500.00 })
    @IsNumber()
    amount: number;

    @ApiProperty({ example: 'USD' })
    @IsString()
    currency: string;

    @ApiPropertyOptional({ example: 'Salary payment' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: '2023-10-27T00:00:00.000Z' })
    @IsDate()
    @Type(() => Date)
    date: Date;

    @ApiPropertyOptional({ example: { note: 'Monthly' } })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}
