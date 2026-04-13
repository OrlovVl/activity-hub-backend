import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private filesService: FilesService,
  ) {}

  private tryParseJson(value: unknown) {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  private normalizeCreateDto(dto: any): Omit<
    CreatePostDto,
    'media' | 'location'
  > & {
    media?: any;
    location?: any;
  } {
    const tagsRaw = dto?.tags;
    const tags = Array.isArray(tagsRaw)
      ? tagsRaw
      : typeof tagsRaw === 'string'
        ? this.tryParseJson(tagsRaw)
        : undefined;

    const tagsNormalized = Array.isArray(tags)
      ? tags.map((t) => String(t))
      : typeof tagsRaw === 'string' && tagsRaw.includes(',')
        ? tagsRaw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const media = this.tryParseJson(dto?.media);
    const location = this.tryParseJson(dto?.location);

    return {
      title: dto?.title,
      content: dto?.content,
      subcategoryId:
        typeof dto?.subcategoryId === 'string'
          ? Number(dto.subcategoryId)
          : dto?.subcategoryId,
      tags: tagsNormalized,
      media,
      location,
    } as any;
  }

  async create(
    authorId: number,
    dto: CreatePostDto,
    photoFile?: Express.Multer.File,
  ) {
    const normalized = this.normalizeCreateDto(dto as any);

    let mediaToSave: any = normalized.media;
    if (photoFile) {
      const uploaded = await this.filesService.uploadFile(photoFile);
      const base =
        mediaToSave && typeof mediaToSave === 'object' ? mediaToSave : {};
      const existingPhotos = Array.isArray(base.photos) ? base.photos : [];
      mediaToSave = { ...base, photos: [uploaded.url, ...existingPhotos] };
    }

    const post = await this.prisma.post.create({
      data: {
        title: normalized.title,
        content: normalized.content,
        subcategoryId: normalized.subcategoryId,
        tags: normalized.tags ?? [],
        media: mediaToSave,
        location: normalized.location,
        authorId,
      },
      include: { author: { select: { username: true } } },
    });

    // Уведомляем подписчиков о новом посте
    this.eventEmitter.emit('post.created', {
      postId: post.id,
      authorId: post.authorId,
      authorName: post.author.username,
      title: post.title,
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

    // Если редактирует НЕ автор (например, модератор), шлем уведомление автору
    if (post.authorId !== userId) {
      this.eventEmitter.emit('notification.create', {
        type: 'MODERATION',
        userId: post.authorId,
        sourceUserId: userId,
        message: `Модератор отредактировал ваш пост: "${post.title}"`,
        postId: post.id,
      });
    }

    return updatedPost;
  }

  async delete(id: number, userId: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Пост не найден');

    // Если удаляет НЕ автор (модератор/админ), уведомляем автора перед удалением
    if (post.authorId !== userId) {
      this.eventEmitter.emit('notification.create', {
        type: 'MODERATION',
        userId: post.authorId,
        sourceUserId: userId,
        message: `Ваш пост "${post.title}" был удален модератором`,
      });
    }

    return this.prisma.post.delete({ where: { id } });
  }

  async findAll(query: any, currentUserId?: number) {
    const {
      subcategoryId,
      authorId,
      tag,
      search,
      limit = 10,
      offset = 0,
    } = query;

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
        author: { select: { id: true, username: true, avatar: true } },
        _count: { select: { comments: true, likes: true } },
        // Используем currentUserId для получения состояния лайка/закладки
        likes: currentUserId ? { where: { userId: currentUserId } } : false,
        bookmarks: currentUserId ? { where: { userId: currentUserId } } : false,
      },
      orderBy: { createdAt: 'desc' },
      take: +limit,
      skip: +offset,
    });

    // Трансформируем результат, чтобы фронтенд получал простые булевы флаги
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

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (post && post.authorId !== userId) {
      this.eventEmitter.emit('notification.create', {
        type: 'LIKE',
        userId: post.authorId,
        sourceUserId: userId,
        message: `оценил ваш пост`,
        postId,
      });
    }

    return res;
  }
}
