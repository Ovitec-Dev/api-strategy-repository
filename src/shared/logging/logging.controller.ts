import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoggingService } from './logging.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Logs')
@ApiBearerAuth()
@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LoggingController {
    constructor(private readonly loggingService: LoggingService) { }

    @Get()
    async getLogs(@Query() filters: any) {
        return this.loggingService.getLogs(filters);
    }

    @Get('order/:orderId')
    async getLogsByOrder(@Param('orderId') orderId: string) {
        return this.loggingService.getLogsByOrder(orderId);
    }

    @Get('execution/:execId')
    async getLogsByExecution(@Param('execId') execId: string) {
        return this.loggingService.getLogsByExecution(execId);
    }
}
