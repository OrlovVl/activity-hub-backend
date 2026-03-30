import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  // Получение всех комментариев поста (включая вложенные)
  @Get('posts/:postId/comments')
  async getByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.getByPost(postId);
  }

  // Создание нового комментария или ответа
  @Post('comments')
  async create(@Body() dto: { content: string; postId: number; parentId?: number }) {
    const userId = 1; // Заглушка
    return this.commentsService.create(userId, dto);
  }

  // Обновление контента
  @Put('comments/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string
  ) {
    const userId = 1; // Заглушка
    return this.commentsService.update(id, userId, content);
  }

  // Удаление комментария
  @Delete('comments/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const userId = 1; // Заглушка
    await this.commentsService.delete(id, userId);
  }

  // Лайк комментария
  @Post('comments/:id/like')
  @HttpCode(HttpStatus.OK)
  async like(@Param('id', ParseIntPipe) id: number) {
    const userId = 1; // Заглушка
    await this.commentsService.toggleLike(userId, id);
  }

  // Снятие лайка
  @Delete('comments/:id/like')
  @HttpCode(HttpStatus.OK)
  async unlike(@Param('id', ParseIntPipe) id: number) {
    const userId = 1; // Заглушка
    await this.commentsService.toggleLike(userId, id); // Toggle работает в обе стороны
  }
}