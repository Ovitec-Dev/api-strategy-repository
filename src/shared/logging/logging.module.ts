import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationLog } from './entities/operation-log.entity';
import { LoggingService } from './logging.service';
import { AppLogger } from './app-logger.service';
import { LoggingController } from './logging.controller';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([OperationLog])],
    controllers: [LoggingController],
    providers: [LoggingService, AppLogger],
    exports: [LoggingService, AppLogger],
})
export class LoggingModule { }
