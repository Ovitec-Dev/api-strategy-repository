import { Global, Module } from '@nestjs/common';
import { AutoMapperService } from './auto-mapper.service';
import {
    StrategyMappingProfile,
    PortfolioProfile,
    OrderProfile,
    TransactionProfile,
    CategoryProfile,
    SubCategoryProfile,
} from '@shared/profiles';

/**
 * Global AutoMapper module.
 * Exported globally so any module can inject AutoMapperService without re-importing.
 */
@Global()
@Module({
    providers: [
        AutoMapperService,
        StrategyMappingProfile,
        PortfolioProfile,
        OrderProfile,
        TransactionProfile,
        CategoryProfile,
        SubCategoryProfile,
    ],
    exports: [AutoMapperService],
})
export class AutoMapperModule { }
