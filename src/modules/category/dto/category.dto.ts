import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '@shared/types';
import { ICreateCategoryDto, ICreateSubCategoryDto, IUpdateSubCategoryDto } from '@shared/interfaces';

export class CreateCategoryDto implements ICreateCategoryDto {
    @ApiPropertyOptional({ description: 'UUID del portafolio asociado' })
    @IsOptional()
    @IsUUID()
    portfolio_id?: string;

    @ApiProperty({ example: 'Entertainment' })
    @IsString()
    name: string;

    @ApiProperty({ enum: CategoryType, example: CategoryType.EXPENSE })
    @IsEnum(CategoryType)
    type: CategoryType | string;

    @ApiPropertyOptional({ example: '#FF5733' })
    @IsOptional()
    @IsString()
    color?: string;

    @ApiPropertyOptional({ example: 'movie' })
    @IsOptional()
    @IsString()
    icon?: string;
}

export class CreateSubCategoryDto implements ICreateSubCategoryDto {
    @ApiProperty({ description: 'UUID de la categoría padre' })
    @IsUUID()
    category_id: string;

    @ApiPropertyOptional({ description: 'UUID del portafolio asociado' })
    @IsOptional()
    @IsUUID()
    portfolio_id?: string;

    @ApiProperty({ example: 'Cinema' })
    @IsString()
    name: string;
}

export class UpdateSubCategoryDto implements IUpdateSubCategoryDto {
    @ApiPropertyOptional({ description: 'UUID del portafolio asociado' })
    @IsOptional()
    @IsUUID()
    portfolio_id?: string;

    @ApiPropertyOptional({ example: 'Cinema VIP' })
    @IsOptional()
    @IsString()
    name?: string;
}
