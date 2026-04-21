import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true, followers: true, following: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const stats = await this.getUserStats(id);
    const followingIds = await this.getFollowingIds(id);

    return {
      ...user,
      stats,
      favoriteSubcategoryIds: [],
      following: followingIds,
      followingCount: stats.followingCount,
    };
  }

  async findAllUsers(params: {
    limit?: number;
    offset?: number;
    search?: string;
  }) {
    const { limit = 20, offset = 0, search } = params;
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as any } },
            { email: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip: +offset, take: +limit }),
      this.prisma.user.count({ where }),
    ]);
    return { users, total };
  }

  async updateProfile(id: number, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async follow(followerId: number, followingId: number) {
    // Проверяем, подписывается ли пользователь сам на себя
    if (followerId === followingId) {
      throw new ForbiddenException('Нельзя подписаться на самого себя');
    }

    const follow = await this.prisma.follow.create({
      data: { followerId, followingId },
    });
    return { followed: true, follow };
  }

  async unfollow(followerId: number, followingId: number) {
    await this.prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return { followed: false };
  }

  // Получить ID пользователей, на которых подписан currentUserId
  async getFollowingIds(userId: number): Promise<number[]> {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    return follows.map((f) => f.followingId);
  }

  // Проверить, подписан ли userId на followingId
  async isFollowing(userId: number, followingId: number): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: userId, followingId } },
    });
    return !!follow;
  }

  // Получить список пользователей, на которых подписан currentUserId (с полными данными)
  async getFollowingUsers(userId: number) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    if (follows.length === 0) {
      return [];
    }
    const followingIds = follows.map((f) => f.followingId);
    return this.prisma.user.findMany({
      where: { id: { in: followingIds } },
      include: {
        _count: { select: { posts: true, followers: true, following: true } },
      },
    });
  }

  // Получить пользователей, подписанных на specificUserId (followers)
  async getFollowers(userId: number) {
    return this.prisma.user.findMany({
      where: { following: { some: { followingId: userId } } },
      include: {
        _count: { select: { posts: true, followers: true, following: true } },
      },
    });
  }

  // Получить подписанные посты (от пользователей, на которых подписан currentUserId)
  async getSubscribedPosts(userId: number) {
    const followingIds = await this.getFollowingIds(userId);
    if (followingIds.length === 0) {
      return [];
    }
    return this.prisma.post.findMany({
      where: { authorId: { in: followingIds } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
  }

  // Получить активных пользователей (по количеству постов и лайков)
  async getActiveUsers(limit: number = 20) {
    return this.prisma.user.findMany({
      take: limit,
      include: {
        _count: { select: { posts: true, followers: true, following: true, postLikes: true, commentLikes: true } },
      },
      orderBy: {
        posts: { _count: 'desc' },
      },
    });
  }

  // Получить stats для конкретного пользователя
  async getUserStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            postLikes: true,
          },
        },
        posts: {
          select: { likesCount: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const totalLikesReceived = user.posts.reduce(
      (sum, p) => sum + p.likesCount,
      0,
    );

    return {
      postsCount: user._count.posts,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      likesCount: totalLikesReceived,
    };
  }

  async addFavoriteSubcategory(userId: number, subcategoryId: number) {
    return this.prisma.userFavoriteSubcategory.create({
      data: { userId, subcategoryId },
    });
  }

  async getFavoriteSubcategories(userId: number) {
    return this.prisma.userFavoriteSubcategory.findMany({
      where: { userId },
      include: { subcategory: true },
    });
  }

  async removeFavoriteSubcategory(userId: number, subcategoryId: number) {
    return this.prisma.userFavoriteSubcategory.delete({
      where: { userId_subcategoryId: { userId, subcategoryId } },
    });
  }

  async addBookmark(userId: number, postId: number) {
    return this.prisma.bookmark.create({
      data: { userId, postId },
    });
  }

  async getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: { post: { include: { author: true } } },
    });
  }

  async removeBookmark(userId: number, postId: number) {
    return this.prisma.bookmark.delete({
      where: { userId_postId: { userId, postId } },
    });
  }

  async getProfileStats(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
        posts: {
          select: { likesCount: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const totalLikesReceived = user.posts.reduce(
      (sum, p) => sum + p.likesCount,
      0,
    );

    return {
      postsCount: user._count.posts,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      likesCount: totalLikesReceived,
    };
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isMatch) throw new ForbiddenException('Текущий пароль неверен');

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash: newHash },
    });
  }
}
