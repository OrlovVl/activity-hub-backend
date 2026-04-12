import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('posts') // Группа в Swagger
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех постов с фильтрацией' })
  async findAll(@Query() query: any, @GetUser('id') userId?: number) {
    // userId подтянется автоматически, если токен передан
    return this.postsService.findAll(query, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth() // Показывает в Swagger, что нужен токен
  @ApiOperation({ summary: 'Создать новый пост' })
  async create(@GetUser('id') userId: number, @Body() dto: CreatePostDto) {
    return this.postsService.create(userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить существующий пост (только для автора)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @Body() dto: UpdatePostDto
  ) {
    return this.postsService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить пост' })
  async delete(@Param('id', ParseIntPipe) id: number, @GetUser('id') userId: number) {
    await this.postsService.delete(id, userId);
  }
}