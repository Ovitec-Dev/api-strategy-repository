import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AutoMapperService } from '@modules/auto-mapper/auto-mapper.service';
import { Strategy } from '@modules/strategy/entities/strategy.entity';
import { IStrategyDto } from '@shared/interfaces';

@Injectable()
export class StrategyMappingProfile implements OnModuleInit {
    private readonly logger = new Logger(StrategyMappingProfile.name);

    constructor(private readonly autoMapper: AutoMapperService) { }

    onModuleInit() {
        this.registerStrategyToDto();
        this.logger.log('✅ Strategy mapping profiles loaded');
    }

    private registerStrategyToDto(): void {
        this.autoMapper.createMap<Strategy, IStrategyDto>(
            'Strategy',
            'StrategyDto',
            (entity: Strategy) => ({
                id: entity.id,
                name: entity.name,
                description: entity.description,
                user_id: entity.user_id,
                status: entity.status,
                created_at: entity.created_at,
                updated_at: entity.updated_at,
                strategy_rules: entity.strategy_rules?.map((rule) => ({
                    id: rule.id,
                    rule_id: rule.rule_id,
                    parameters: rule.parameters
                })),
            }),
        );
    }
}
