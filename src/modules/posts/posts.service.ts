import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) { }

    async create(authorId: number, dto: CreatePostDto) {
        return this.prisma.post.create({
            data: { ...dto, authorId }
        });
    }

    async update(id: number, userId: number, dto: UpdatePostDto) {
        const post = await this.prisma.post.findUnique({ where: { id } });

        if (!post) throw new NotFoundException('Пост не найден');
        if (post.authorId !== userId) throw new ForbiddenException('Вы не автор этого поста');

        return this.prisma.post.update({ where: { id }, data: dto });
    }

    async delete(id: number, userId: number) {
        const post = await this.prisma.post.findUnique({ where: { id } });

        if (!post) throw new NotFoundException('Пост не найден');
        if (post.authorId !== userId) throw new ForbiddenException('Вы не можете удалить чужой пост');

        return this.prisma.post.delete({ where: { id } });
    }

    async findAll(query: any, currentUserId?: number) {
        const {
            subcategoryId,
            authorId,
            tag,
            sortBy,
            dateFrom,
            dateTo,
            limit = 10,
            offset = 0,
            followedByUserId // ID пользователя, на чьи подписки мы смотрим
        } = query;

        // 1. Формируем условия фильтрации
        const where: any = {
            subcategoryId: subcategoryId ? +subcategoryId : undefined,
            authorId: authorId ? +authorId : undefined,
            tags: tag ? { has: tag } : undefined,
            createdAt: {
                gte: dateFrom ? new Date(dateFrom) : undefined,
                lte: dateTo ? new Date(dateTo) : undefined,
            },
        };

        // 2. Добавляем логику ленты подписок (Followed Feed)
        if (followedByUserId) {
            where.author = {
                followers: {
                    some: {
                        followerId: +followedByUserId
                    }
                }
            };
        }

        // 3. Выполняем запрос
        const posts = await this.prisma.post.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    }
                },
                // Загружаем лайк/закладку только для текущего юзера (для флагов)
                likes: currentUserId ? { where: { userId: currentUserId } } : false,
                bookmarks: currentUserId ? { where: { userId: currentUserId } } : false,
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    }
                }
            },
            orderBy: sortBy === 'popularity'
                ? { likesCount: 'desc' }
                : { createdAt: 'desc' },
            skip: +offset,
            take: +limit,
        });

        // 4. Мапим результат (добавляем UI-флаги)
        return posts.map(post => {
            const { likes, bookmarks, ...rest } = post;
            return {
                ...rest,
                isLiked: likes?.length > 0,
                isBookmarked: bookmarks?.length > 0,
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
                _count: { select: { comments: true, likes: true } }
            }
        });
        if (!post) throw new NotFoundException('Пост не найден');

        const { likes, bookmarks, ...rest } = post;
        return {
            ...rest,
            isLiked: likes?.length > 0,
            isBookmarked: bookmarks?.length > 0,
        };
    }

    async toggleLike(userId: number, postId: number) {
        const existing = await this.prisma.postLike.findUnique({
            where: { userId_postId: { userId, postId } }
        });

        if (existing) {
            return this.prisma.$transaction([
                this.prisma.postLike.delete({ where: { userId_postId: { userId, postId } } }),
                this.prisma.post.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } })
            ]);
        }

        return this.prisma.$transaction([
            this.prisma.postLike.create({ data: { userId, postId } }),
            this.prisma.post.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } })
        ]);
    }
}