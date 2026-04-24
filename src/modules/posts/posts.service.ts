import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(authorId: number, dto: CreatePostDto) {
    const { title, content, subcategoryId, tags, location } = dto;

    const post = await this.prisma.post.create({
      data: {
        title,
        content,
        subcategoryId,
        tags: tags ?? [],
        location,
        authorId,
      },
      include: { author: { select: { id: true, username: true } } },
    });

    return post;
  }

  async update(id: number, userId: number, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Пост не найден');

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: dto,
    });

    return updatedPost;
  }

  async delete(id: number, userId: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Пост не найден');

    return this.prisma.post.delete({ where: { id } });
  }

  async findAll(query: any, currentUserId?: number) {
    const { subcategoryId, authorId, tag, search, limit = 10, offset = 0 } = query;

    const posts = await this.prisma.post.findMany({
      where: {
        ...(subcategoryId ? { subcategoryId: +subcategoryId } : {}),
        ...(authorId ? { authorId: +authorId } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' as any } },
                { content: { contains: search, mode: 'insensitive' as any } },
              ],
            }
          : {}),
      },
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true, likes: true } },
        likes: currentUserId ? { where: { userId: currentUserId } } : false,
        bookmarks: currentUserId ? { where: { userId: currentUserId } } : false,
      },
      orderBy: { createdAt: 'desc' },
      take: +limit,
      skip: +offset,
    });

    return posts.map((post) => {
      const { likes, bookmarks, ...rest } = post;
      return {
        ...rest,
        isLiked: likes ? likes.length > 0 : false,
        isBookmarked: bookmarks ? bookmarks.length > 0 : false,
      };
    });
  }

  async findOne(id: number, currentUserId?: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        likes: currentUserId ? { where: { userId: currentUserId } } : false,
        bookmarks: currentUserId ? { where: { userId: currentUserId } } : false,
        _count: { select: { comments: true, likes: true } },
      },
    });
    if (!post) throw new NotFoundException('Пост не найден');

    const { likes, bookmarks, ...rest } = post;
    return {
      ...rest,
      isLiked: likes ? likes.length > 0 : false,
      isBookmarked: bookmarks ? bookmarks.length > 0 : false,
    };
  }

  async toggleLike(userId: number, postId: number) {
    const existing = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      return this.prisma.$transaction([
        this.prisma.postLike.delete({
          where: { userId_postId: { userId, postId } },
        }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
    }

    const res = await this.prisma.$transaction([
      this.prisma.postLike.create({ data: { userId, postId } }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);

    return res;
  }

  async getCommentsCount(postId: number): Promise<number> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { commentsCount: true },
    });
    return post?.commentsCount ?? 0;
  }
}
