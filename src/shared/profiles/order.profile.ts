import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AutoMapperService } from '@modules/auto-mapper/auto-mapper.service';
import { Order } from '@modules/order/entities/order.entity';
import { IOrder } from '@shared/interfaces';

@Injectable()
export class OrderProfile implements OnModuleInit {
    private readonly logger = new Logger(OrderProfile.name);

    constructor(private readonly autoMapper: AutoMapperService) { }

    onModuleInit() {
        this.registerMappings();
        this.logger.log('✅ Order mapping profiles loaded');
    }

    private registerMappings(): void {
        this.autoMapper.createMap<Order, IOrder>(
            'Order',
            'OrderDto',
            (entity: Order) => ({
                id: entity.id,
                user_id: entity.user?.id,
                portfolio_id: entity.portfolio?.id,
                strategy_id: entity.strategy?.id,
                externalRef: entity.externalRef,
                type: entity.type,
                status: entity.status,
                asset: entity.asset,
                amount: entity.amount,
                currency: entity.currency,
                executedAmount: entity.executedAmount,
                metadata: entity.metadata,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
                completedAt: entity.completedAt,
            }),
        );
    }
}
