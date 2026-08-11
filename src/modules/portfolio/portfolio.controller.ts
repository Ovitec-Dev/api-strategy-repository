import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePortfolioDto, UpdatePortfolioDto, UpdateBudgetDto } from './dto/portfolio.dto';

@ApiTags('Portfolios')
@ApiBearerAuth()
@Controller('portfolios')
@UseGuards(JwtAuthGuard)
export class PortfolioController {
    constructor(private readonly portfolioService: PortfolioService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nuevo portafolio' })
    @ApiResponse({ status: 201, description: 'Portafolio creado' })
    async create(@CurrentUser() user: any, @Body() data: CreatePortfolioDto) {
        return this.portfolioService.createPortfolio(user.id, data);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los portafolios del usuario' })
    async findAll(@CurrentUser() user: any) {
        return this.portfolioService.getPortfolios(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener portafolio por ID' })
    async findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.portfolioService.getPortfolioById(user.id, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar portafolio' })
    async update(@CurrentUser() user: any, @Param('id') id: string, @Body() data: UpdatePortfolioDto) {
        return this.portfolioService.updatePortfolio(user.id, id, data);
    }

    @Delete(':id')
    async remove(@CurrentUser() user: any, @Param('id') id: string) {
        await this.portfolioService.deletePortfolio(user.id, id);
        return { success: true };
    }

    @Post(':id/budgets')
    async createBudget(@CurrentUser() user: any, @Param('id') id: string, @Body() data: any) {
        return this.portfolioService.createBudget(user.id, id, data);
    }

    @Get(':id/budgets')
    async getBudgets(@CurrentUser() user: any, @Param('id') id: string) {
        return this.portfolioService.getBudgets(user.id, id);
    }

    @Put(':id/budgets/:bid')
    @ApiOperation({ summary: 'Actualizar presupuesto' })
    @ApiResponse({ status: 200, description: 'Presupuesto actualizado' })
    @ApiResponse({ status: 404, description: 'Presupuesto o portafolio no encontrado' })
    async updateBudget(@CurrentUser() user: any, @Param('id') id: string, @Param('bid') bid: string, @Body() data: UpdateBudgetDto) {
        return this.portfolioService.updateBudget(user.id, id, bid, data);
    }

    @Delete(':id/budgets/:bid')
    async removeBudget(@CurrentUser() user: any, @Param('id') id: string, @Param('bid') bid: string) {
        await this.portfolioService.deleteBudget(user.id, id, bid);
        return { success: true };
    }
}
