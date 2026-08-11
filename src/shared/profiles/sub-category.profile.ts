import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AutoMapperService } from '@modules/auto-mapper/auto-mapper.service';
import { SubCategory } from '@modules/category/entities/sub-category.entity';
import { ISubCategory } from '@shared/interfaces';

@Injectable()
export class SubCategoryProfile implements OnModuleInit {
    private readonly logger = new Logger(SubCategoryProfile.name);

    constructor(private readonly autoMapper: AutoMapperService) { }

    onModuleInit() {
        this.registerMappings();
        this.logger.log('✅ SubCategory mapping profiles loaded');
    }

    private registerMappings(): void {
        this.autoMapper.createMap<SubCategory, ISubCategory>(
            'SubCategory',
            'SubCategoryDto',
            (entity: SubCategory) => ({
                id: entity.id,
                category_id: entity.category?.id,
                portfolio_id: entity.portfolio?.id,
                name: entity.name,
                createdAt: entity.createdAt,
            }),
        );
    }
}
