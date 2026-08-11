import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AutoMapperService } from '../auto-mapper.service';
import { Strategy } from '../../strategy/entities/strategy.entity';

@Injectable()
export class StrategyMappingProfile implements OnModuleInit {
    private readonly logger = new Logger(StrategyMappingProfile.name);

    constructor(private readonly autoMapper: AutoMapperService) { }

    onModuleInit() {
        this.registerStrategyToDto();
        this.logger.log('✅ Strategy mapping profiles loaded');
    }

    private registerStrategyToDto(): void {
        this.autoMapper.createMap<Strategy, any>(
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
