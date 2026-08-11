import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AutoMapperService } from '@modules/auto-mapper/auto-mapper.service';
import { Transaction } from '@modules/transaction/entities/transaction.entity';
import { ITransaction } from '@shared/interfaces';

@Injectable()
export class TransactionProfile implements OnModuleInit {
    private readonly logger = new Logger(TransactionProfile.name);

    constructor(private readonly autoMapper: AutoMapperService) { }

    onModuleInit() {
        this.registerMappings();
        this.logger.log('✅ Transaction mapping profiles loaded');
    }

    private registerMappings(): void {
        this.autoMapper.createMap<Transaction, ITransaction>(
            'Transaction',
            'TransactionDto',
            (entity: Transaction) => ({
                id: entity.id,
                user_id: entity.user?.id,
                portfolio_id: entity.portfolio?.id,
                category_id: entity.category?.id,
                sub_category_id: entity.subCategory?.id,
                order_id: entity.order?.id,
                type: entity.type,
                amount: entity.amount,
                currency: entity.currency,
                description: entity.description,
                date: entity.date,
                metadata: entity.metadata,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
            }),
        );
    }
}
