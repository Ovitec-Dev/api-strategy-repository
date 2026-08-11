import { Controller, Get, HttpCode, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { MessageBrokerService } from '@shared/messaging/messaging.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private readonly dataSource: DataSource,
        private readonly messageBroker: MessageBrokerService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Healthcheck de infraestructura (sin autenticación)' })
    @ApiResponse({ status: 200, description: 'Servicio saludable' })
    @ApiResponse({ status: 503, description: 'Servicio degradado' })
    @HttpCode(HttpStatus.OK)
    async check() {
        let database = 'up';
        try {
            await this.dataSource.query('SELECT 1');
        } catch {
            database = 'down';
        }

        const messageBroker = this.messageBroker.isConnected() ? 'up' : 'down';

        const body = {
            status: database === 'up' ? 'ok' : 'degraded',
            service: 'api-strategy-repository',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            checks: { database, messageBroker },
        };

        if (database === 'down') {
            throw new ServiceUnavailableException(body);
        }
        return body;
    }
}
