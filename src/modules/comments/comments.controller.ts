import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'Получить все комментарии поста' })
  async getByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.getByPost(postId);
  }

  @Post('comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новый комментарий или ответ' })
  async create(
    @GetUser('id') userId: number,
    @Body() dto: { content: string; postId: number; parentId?: number },
  ) {
    return this.commentsService.create(userId, dto);
  }

  @Put('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Редактировать свой комментарий' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @Body('content') content: string,
  ) {
    return this.commentsService.update(id, userId, content);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить свой комментарий' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    await this.commentsService.delete(id, userId);
  }

  @Post('comments/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Поставить/убрать лайк на комментарий' })
  async like(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    return this.commentsService.toggleLike(userId, id);
  }
}
