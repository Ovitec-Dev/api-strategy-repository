import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AutoMapperService } from '@modules/auto-mapper/auto-mapper.service';
import { Category } from '@modules/category/entities/category.entity';
import { ICategory } from '@shared/interfaces';

@Injectable()
export class CategoryProfile implements OnModuleInit {
    private readonly logger = new Logger(CategoryProfile.name);

    constructor(private readonly autoMapper: AutoMapperService) { }

    onModuleInit() {
        this.registerMappings();
        this.logger.log('✅ Category mapping profiles loaded');
    }

    private registerMappings(): void {
        this.autoMapper.createMap<Category, ICategory>(
            'Category',
            'CategoryDto',
            (entity: Category) => ({
                id: entity.id,
                user_id: entity.user?.id,
                portfolio_id: entity.portfolio?.id,
                name: entity.name,
                type: entity.type,
                color: entity.color,
                icon: entity.icon,
                isSystem: entity.isSystem,
                createdAt: entity.createdAt,
            }),
        );
    }
}
