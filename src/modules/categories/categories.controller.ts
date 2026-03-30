import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Get('categories')
  async findAllMain() {
    return this.categoriesService.findAllMain();
  }

  @Get('categories/tree')
  async getTree() {
    return this.categoriesService.getTree();
  }

  @Get('subcategories')
  async findSubcategories(@Query('mainCategoryId') mainId?: number, @Query('showAll') showAll?: boolean) {
    return this.categoriesService.findSubcategories(mainId, showAll);
  }

  @Post('subcategories')
  async createSub(@Body() dto: any) {
    return this.categoriesService.createSubcategory(1, dto);
  }

  @Patch('subcategories/:id/approve')
  async approve(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.approveSubcategory(id);
  }
}