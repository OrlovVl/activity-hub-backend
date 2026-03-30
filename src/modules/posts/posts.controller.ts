import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @Get()
  async findAll(@Query() query: any) {
    const currentUserId = 1; // Заглушка для проверки isLiked/isBookmarked
    return this.postsService.findAll(query, currentUserId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const currentUserId = 1; // Заглушка
    return this.postsService.findOne(id, currentUserId);
  }

  @Post()
  async create(@Body() dto: CreatePostDto) {
    const userId = 1; // Заглушка
    return this.postsService.create(userId, dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto
  ) {
    const userId = 1; // В будущем здесь будет req.user.id из AuthGuard
    return this.postsService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const userId = 1; // В будущем здесь будет req.user.id
    await this.postsService.delete(id, userId);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  async like(@Param('id', ParseIntPipe) id: number) {
    const userId = 1; // Заглушка
    await this.postsService.toggleLike(userId, id);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  async unlike(@Param('id', ParseIntPipe) id: number) {
    const userId = 1; // Заглушка
    await this.postsService.toggleLike(userId, id);
  }
}