import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AutoMapperService } from '@modules/auto-mapper/auto-mapper.service';
import { Portfolio } from '@modules/portfolio/entities/portfolio.entity';
import { IPortfolio } from '@shared/interfaces';

@Injectable()
export class PortfolioProfile implements OnModuleInit {
    private readonly logger = new Logger(PortfolioProfile.name);

    constructor(private readonly autoMapper: AutoMapperService) { }

    onModuleInit() {
        this.registerMappings();
        this.logger.log('✅ Portfolio mapping profiles loaded');
    }

    private registerMappings(): void {
        this.autoMapper.createMap<Portfolio, IPortfolio>(
            'Portfolio',
            'PortfolioDto',
            (entity: Portfolio) => ({
                id: entity.id,
                user_id: entity.user?.id,
                name: entity.name,
                description: entity.description,
                currency: entity.currency,
                isDefault: entity.isDefault,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
            }),
        );
    }
}
