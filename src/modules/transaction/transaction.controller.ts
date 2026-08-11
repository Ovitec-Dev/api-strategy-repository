import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/transaction.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }

    @Post()
    @ApiOperation({ summary: 'Registrar nueva transacción' })
    @ApiResponse({ status: 201, description: 'Transacción registrada' })
    async create(@CurrentUser() user: any, @Body() data: CreateTransactionDto) {
        return this.transactionService.createTransaction(user.id, data);
    }

    @Get()
    async findAll(@CurrentUser() user: any, @Query() filters: any) {
        return this.transactionService.getTransactions(user.id, filters);
    }

    @Get(':id')
    async findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.transactionService.getTransactionById(user.id, id);
    }

    @Put(':id')
    async update(@CurrentUser() user: any, @Param('id') id: string, @Body() data: any) {
        return this.transactionService.updateTransaction(user.id, id, data);
    }

    @Delete(':id')
    async remove(@CurrentUser() user: any, @Param('id') id: string) {
        await this.transactionService.deleteTransaction(user.id, id);
        return { success: true };
    }
}
