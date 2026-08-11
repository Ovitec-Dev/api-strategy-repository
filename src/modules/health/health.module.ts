import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { MessagingModule } from '@shared/messaging/messaging.module';

@Module({
    imports: [MessagingModule],
    controllers: [HealthController],
})
export class HealthModule { }
