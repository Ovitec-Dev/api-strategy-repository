import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCategoryDto, CreateSubCategoryDto, UpdateSubCategoryDto } from './dto/category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nueva categoría' })
    @ApiResponse({ status: 201, description: 'Categoría creada' })
    async create(@CurrentUser() user: any, @Body() data: CreateCategoryDto) {
        return this.categoryService.createCategory(user.id, data);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las categorías' })
    async findAll(@CurrentUser() user: any) {
        return this.categoryService.getCategories(user.id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar categoría' })
    async update(@CurrentUser() user: any, @Param('id') id: string, @Body() data: any) {
        return this.categoryService.updateCategory(user.id, id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar categoría' })
    async remove(@CurrentUser() user: any, @Param('id') id: string) {
        await this.categoryService.deleteCategory(user.id, id);
        return { success: true };
    }

    @Post(':id/subcategories')
    @ApiOperation({ summary: 'Crear nueva subcategoría' })
    async createSub(@CurrentUser() user: any, @Param('id') id: string, @Body() data: CreateSubCategoryDto) {
        return this.categoryService.createSubCategory(user.id, id, data);
    }

    @Get(':id/subcategories/:sid')
    @ApiOperation({ summary: 'Obtener subcategoría por ID' })
    @ApiResponse({ status: 200, description: 'Detalle de la subcategoría' })
    @ApiResponse({ status: 404, description: 'Subcategoría no encontrada o sin acceso' })
    async findOneSub(@CurrentUser() user: any, @Param('id') id: string, @Param('sid') sid: string) {
        return this.categoryService.getSubCategory(user.id, id, sid);
    }

    @Put(':id/subcategories/:sid')
    @ApiOperation({ summary: 'Actualizar subcategoría' })
    @ApiResponse({ status: 200, description: 'Subcategoría actualizada' })
    @ApiResponse({ status: 404, description: 'Subcategoría no encontrada o sin acceso' })
    async updateSub(@CurrentUser() user: any, @Param('id') id: string, @Param('sid') sid: string, @Body() data: UpdateSubCategoryDto) {
        return this.categoryService.updateSubCategory(user.id, id, sid, data);
    }

    @Delete(':id/subcategories/:sid')
    async removeSub(@CurrentUser() user: any, @Param('id') id: string, @Param('sid') sid: string) {
        await this.categoryService.deleteSubCategory(user.id, id, sid);
        return { success: true };
    }
}
