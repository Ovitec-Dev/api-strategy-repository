import { Injectable, Logger, Scope } from '@nestjs/common';
import { LoggingService, LogMeta } from './logging.service';
import { LogLevel } from './entities/operation-log.entity';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends Logger {
    constructor(private readonly loggingService: LoggingService) {
        super();
    }

    log(message: string, context?: string, meta?: LogMeta) {
        super.log(message, context);
        if (meta?.orderId || meta?.strategyId || meta?.executionId) {
            this.loggingService.persist(LogLevel.INFO, message, context, meta).catch(err => {
                super.error(`Failed to persist log: ${err.message}`, undefined, 'AppLogger');
            });
        }
    }

    error(message: string, trace?: string, context?: string, meta?: LogMeta) {
        super.error(message, trace, context);
        if (meta?.orderId || meta?.strategyId || meta?.executionId) {
            this.loggingService.persist(LogLevel.ERROR, message, context, { ...meta, trace }).catch(err => {
                super.error(`Failed to persist log: ${err.message}`, undefined, 'AppLogger');
            });
        }
    }

    warn(message: string, context?: string, meta?: LogMeta) {
        super.warn(message, context);
        if (meta?.orderId || meta?.strategyId || meta?.executionId) {
            this.loggingService.persist(LogLevel.WARN, message, context, meta).catch(err => {
                super.error(`Failed to persist log: ${err.message}`, undefined, 'AppLogger');
            });
        }
    }

    debug(message: string, context?: string, meta?: LogMeta) {
        super.debug(message, context);
        if (meta?.orderId || meta?.strategyId || meta?.executionId) {
            this.loggingService.persist(LogLevel.DEBUG, message, context, meta).catch(err => {
                super.error(`Failed to persist log: ${err.message}`, undefined, 'AppLogger');
            });
        }
    }
}
