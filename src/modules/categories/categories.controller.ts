import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('categories')
@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Список главных категорий' })
  async getMain() {
    return this.categoriesService.findAllMain();
  }

  @Get('categories/tree')
  @ApiOperation({ summary: 'Получить всё дерево категорий и подкатегорий' })
  async getTree() {
    return this.categoriesService.getTree();
  }

  @Get('subcategories')
  @ApiOperation({ summary: 'Список подкатегорий (по желанию фильтрация)' })
  async getSubcategories(
    @Query('mainCategoryId') mainCategoryId?: string,
    @Query('showAll') showAll?: string,
  ) {
    return this.categoriesService.findSubcategories(
      mainCategoryId ? +mainCategoryId : undefined,
      showAll === 'true',
    );
  }

   @Put('subcategories/:id')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(Role.ADMIN)
   @ApiBearerAuth()
   @ApiOperation({ summary: 'Обновить подкатегорию (персонал)' })
  async updateSub(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.categoriesService.updateSubcategory(id, dto);
  }

   @Delete('subcategories/:id')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(Role.ADMIN)
   @ApiBearerAuth()
   @ApiOperation({ summary: 'Удалить подкатегорию (персонал)' })
  async deleteSub(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteSubcategory(id);
  }

  @Post('subcategories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Предложить новую подкатегорию (isApproved: false)',
  })
  async createSub(
    @GetUser('id') userId: number,
    @Body() dto: { name: string; description: string; mainCategoryId: number },
  ) {
    return this.categoriesService.createSubcategory(userId, dto);
  }

   @Patch('subcategories/:id/approve')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(Role.ADMIN)
   @ApiBearerAuth()
   @ApiOperation({ summary: 'Одобрить подкатегорию (только для администраторов)' })
  async approve(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.approveSubcategory(id);
  }
}
