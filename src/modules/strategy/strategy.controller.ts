import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { StrategyService } from './strategy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateStrategyDto, UpdateStrategyDto } from '@/dtos/CreateStrategyDto';

@ApiTags('Strategies')
@ApiBearerAuth()
@Controller('strategies')
@UseGuards(JwtAuthGuard)
export class StrategyController {
    constructor(private readonly strategyService: StrategyService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nueva estrategia' })
    @ApiResponse({ status: 201, description: 'Estrategia creada' })
    async createStrategy(@CurrentUser() user: any, @Body() data: CreateStrategyDto) {
        return this.strategyService.createStrategy(user.id, data);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las estrategias del usuario' })
    @ApiResponse({ status: 200, description: 'Lista de estrategias' })
    async getStrategiesByUserId(@CurrentUser() user: any) {
        return this.strategyService.getStrategies(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener estrategia por ID' })
    @ApiParam({ name: 'id', description: 'UUID de la estrategia' })
    @ApiResponse({ status: 200, description: 'Detalle de la estrategia' })
    @ApiResponse({ status: 404, description: 'Estrategia no encontrada' })
    async getStrategyById(@CurrentUser() user: any, @Param('id') id: string) {
        return this.strategyService.getStrategyById(user.id, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar estrategia' })
    @ApiParam({ name: 'id', description: 'UUID de la estrategia' })
    @ApiResponse({ status: 200, description: 'Estrategia actualizada' })
    async updateStrategy(@CurrentUser() user: any, @Param('id') id: string, @Body() body: UpdateStrategyDto) {
        return this.strategyService.updateStrategy(user.id, id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Archivar estrategia (soft delete)' })
    @ApiParam({ name: 'id', description: 'UUID de la estrategia' })
    @ApiResponse({ status: 200, description: 'Estrategia archivada' })
    async deleteStrategy(@CurrentUser() user: any, @Param('id') id: string) {
        await this.strategyService.archiveStrategy(user.id, id);
        return { success: true };
    }

    @Post(':id/schedule')
    @ApiOperation({ summary: 'Crear schedule para estrategia' })
    @ApiParam({ name: 'id', description: 'UUID de la estrategia' })
    @ApiResponse({ status: 201, description: 'Schedule creado' })
    async createSchedule(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
        return this.strategyService.createSchedule(user.id, id, body);
    }

    @Put(':id/schedule')
    @ApiOperation({ summary: 'Actualizar schedule' })
    @ApiParam({ name: 'id', description: 'UUID de la estrategia' })
    async updateSchedule(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
        return this.strategyService.updateSchedule(user.id, id, body);
    }

    @Delete(':id/schedule')
    @ApiOperation({ summary: 'Desactivar schedule' })
    @ApiParam({ name: 'id', description: 'UUID de la estrategia' })
    async deleteSchedule(@CurrentUser() user: any, @Param('id') id: string) {
        await this.strategyService.deleteSchedule(user.id, id);
        return { success: true };
    }

    @Get(':id/executions')
    @ApiOperation({ summary: 'Obtener ejecuciones de una estrategia' })
    @ApiParam({ name: 'id', description: 'UUID de la estrategia' })
    @ApiResponse({ status: 200, description: 'Lista de ejecuciones' })
    async getExecutions(@CurrentUser() user: any, @Param('id') id: string) {
        return this.strategyService.getExecutions(user.id, id);
    }

    @Get(':id/executions/:execId')
    @ApiOperation({ summary: 'Obtener detalle de una ejecución' })
    @ApiParam({ name: 'id', description: 'UUID de la estrategia' })
    @ApiParam({ name: 'execId', description: 'UUID de la ejecución' })
    async getExecutionById(@CurrentUser() user: any, @Param('id') id: string, @Param('execId') execId: string) {
        return this.strategyService.getExecutionById(user.id, id, execId);
    }

    @Post(':id/execute')
    @ApiOperation({ summary: 'Ejecutar estrategia manualmente' })
    @ApiParam({ name: 'id', description: 'UUID de la estrategia' })
    @ApiResponse({ status: 201, description: 'Ejecución iniciada' })
    async executeManual(@CurrentUser() user: any, @Param('id') id: string) {
        return this.strategyService.executeManual(user.id, id);
    }

    @Get(':id/executions/:execId/logs')
    @ApiOperation({ summary: 'Obtener logs de una ejecución' })
    @ApiParam({ name: 'id', description: 'UUID de la estrategia' })
    @ApiParam({ name: 'execId', description: 'UUID de la ejecución' })
    async getExecutionLogs(@CurrentUser() user: any, @Param('id') id: string, @Param('execId') execId: string) {
        return { message: "Logs endpoint placeholder", execId };
    }
}
