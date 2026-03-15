import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) { }

  async create(authorId: number, dto: { content: string; postId: number; parentId?: number }) {
    return this.prisma.comment.create({
      data: {
        content: dto.content,
        authorId,
        postId: dto.postId,
        parentId: dto.parentId || null
      }
    });
  }

  async update(id: number, userId: number, content: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) throw new NotFoundException('Комментарий не найден');
    if (comment.authorId !== userId) throw new ForbiddenException('Нельзя редактировать чужой комментарий');

    return this.prisma.comment.update({ where: { id }, data: { content } });
  }

  async toggleLike(userId: number, commentId: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Комментарий не найден');

    const existing = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } }
    });

    if (existing) {
      return this.prisma.$transaction([
        this.prisma.commentLike.delete({ where: { userId_commentId: { userId, commentId } } }),
        this.prisma.comment.update({ where: { id: commentId }, data: { likesCount: { decrement: 1 } } })
      ]);
    }

    return this.prisma.$transaction([
      this.prisma.commentLike.create({ data: { userId, commentId } }),
      this.prisma.comment.update({ where: { id: commentId }, data: { likesCount: { increment: 1 } } })
    ]);
  }

  async getByPost(postId: number) {
    return this.prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        replies: { include: { author: true } },
        author: true
      }
    });
  }
}
