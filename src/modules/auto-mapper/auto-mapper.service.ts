import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

export interface MappingFn<TSource, TDestination> {
    (source: TSource): TDestination;
}

@Injectable()
export class AutoMapperService implements OnModuleInit {
    private readonly logger = new Logger(AutoMapperService.name);
    private mappings = new Map<string, MappingFn<any, any>>();

    /**
     * Called by NestJS after all modules are initialized.
     * Validates that all registered profiles have their mappings properly configured.
     */
    onModuleInit() {
        this.logger.log(`✅ AutoMapper initialized with ${this.mappings.size} mapping(s):`);
        for (const key of this.mappings.keys()) {
            this.logger.log(`   → ${key}`);
        }

        if (this.mappings.size === 0) {
            this.logger.warn('⚠️  AutoMapper: No mappings registered. Did you forget to call createMap()?');
        }
    }

    /**
     * Register a mapping between two types.
     * Call this inside an OnModuleInit of a profile service.
     */
    createMap<TSource, TDestination>(
        sourceType: string,
        destinationType: string,
        mappingFn: MappingFn<TSource, TDestination>,
    ): void {
        const key = `${sourceType}_to_${destinationType}`;
        this.mappings.set(key, mappingFn);
        this.logger.debug(`Registered mapping: ${key}`);
    }

    /**
     * Map a single object from source to destination type.
     * Throws a clear error at call-time if the mapping is missing.
     */
    map<TSource, TDestination>(
        source: TSource,
        sourceType: string,
        destinationType: string,
    ): TDestination {
        const key = `${sourceType}_to_${destinationType}`;
        const mappingFn = this.mappings.get(key);

        if (!mappingFn) {
            throw new Error(
                `❌ AutoMapper: No mapping found for "${key}". ` +
                `Make sure the profile is registered and the module is initialized.`,
            );
        }

        return mappingFn(source) as TDestination;
    }

    /**
     * Map an array of objects.
     */
    mapArray<TSource, TDestination>(
        sources: TSource[],
        sourceType: string,
        destinationType: string,
    ): TDestination[] {
        return sources.map((source) => this.map<TSource, TDestination>(source, sourceType, destinationType));
    }

    /**
     * Check if a mapping exists without throwing.
     */
    hasMapping(sourceType: string, destinationType: string): boolean {
        return this.mappings.has(`${sourceType}_to_${destinationType}`);
    }
}
