import { Controller, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getProfile(@CurrentUser() user: any) {
        return this.usersService.getProfile(user.id);
    }

    @Put('me')
    async updateProfile(@CurrentUser() user: any, @Body() updateData: any) {
        return this.usersService.updateProfile(user.id, updateData);
    }

    @Delete('me')
    async softDelete(@CurrentUser() user: any) {
        await this.usersService.softDelete(user.id);
        return { success: true, message: 'Account deactivated' };
    }

    // Admin routes
    @Get()
    @Roles(UserRole.ADMIN)
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN)
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Put(':id/role')
    @Roles(UserRole.ADMIN)
    async changeRole(@Param('id') id: string, @Body('role') role: UserRole) {
        return this.usersService.changeRole(id, role);
    }
}
