import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    authorId: number,
    dto: { content: string; postId: number; parentId?: number },
  ) {
    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        authorId,
        postId: dto.postId,
        parentId: dto.parentId || null,
      },
      include: {
        author: { select: { username: true } },
        post: { select: { authorId: true } },
      },
    });

    // Сценарий 1: Ответ на комментарий
    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });
      if (parentComment && parentComment.authorId !== authorId) {
        this.eventEmitter.emit('notification.create', {
          type: 'COMMENT',
          userId: parentComment.authorId,
          sourceUserId: authorId,
          message: `ответил на ваш комментарий`,
          postId: dto.postId,
          commentId: comment.id,
        });
      }
    }
    // Сценарий 2: Комментарий к посту
    else if (comment.post.authorId !== authorId) {
      this.eventEmitter.emit('notification.create', {
        type: 'COMMENT',
        userId: comment.post.authorId,
        sourceUserId: authorId,
        message: `прокомментировал ваш пост`,
        postId: dto.postId,
        commentId: comment.id,
      });
    }

    return comment;
  }

  async getByPost(postId: number) {
    return this.prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: number, userId: number, content: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Комментарий не найден');

    const updated = await this.prisma.comment.update({
      where: { id },
      data: { content },
    });

    // Уведомление если редактирует модератор
    if (comment.authorId !== userId) {
      this.eventEmitter.emit('notification.create', {
        type: 'MODERATION',
        userId: comment.authorId,
        sourceUserId: userId,
        message: `Модератор изменил ваш комментарий`,
        postId: comment.postId,
      });
    }

    return updated;
  }

  async delete(id: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException();

    if (comment.authorId !== userId) {
      this.eventEmitter.emit('notification.create', {
        type: 'MODERATION',
        userId: comment.authorId,
        sourceUserId: userId,
        message: `Ваш комментарий был удален модератором`,
      });
    }

    return this.prisma.comment.delete({ where: { id } });
  }

  async toggleLike(userId: number, commentId: number) {
    const existing = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existing) {
      return this.prisma.$transaction([
        this.prisma.commentLike.delete({
          where: { userId_commentId: { userId, commentId } },
        }),
        this.prisma.comment.update({
          where: { id: commentId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
    }

    return this.prisma.$transaction([
      this.prisma.commentLike.create({ data: { userId, commentId } }),
      this.prisma.comment.update({
        where: { id: commentId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);
  }
}
