import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/order.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nueva orden' })
    @ApiResponse({ status: 201, description: 'Orden creada exitosamente' })
    async create(@CurrentUser() user: any, @Body() data: CreateOrderDto) {
        return this.orderService.createOrder(user.id, data);
    }

    @Get()
    async findAll(@CurrentUser() user: any, @Query() filters: any) {
        return this.orderService.getOrders(user.id, filters);
    }

    @Get(':id')
    async findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.orderService.getOrderById(user.id, id);
    }

    @Put(':id/status')
    async updateStatus(@CurrentUser() user: any, @Param('id') id: string, @Body('status') status: any) {
        return this.orderService.updateOrderStatus(user.id, id, status);
    }

    @Delete(':id')
    async remove(@CurrentUser() user: any, @Param('id') id: string) {
        await this.orderService.deleteOrder(user.id, id);
        return { success: true };
    }
}
