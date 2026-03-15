import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true, followers: true, following: true } }
      }
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: number, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async follow(followerId: number, followingId: number) {
    return this.prisma.follow.create({
      data: { followerId, followingId }
    });
  }

  async unfollow(followerId: number, followingId: number) {
    return this.prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } }
    });
  }

  async addFavoriteSubcategory(userId: number, subcategoryId: number) {
    return this.prisma.userFavoriteSubcategory.create({
      data: { userId, subcategoryId }
    });
  }

  async getFavoriteSubcategories(userId: number) {
    return this.prisma.userFavoriteSubcategory.findMany({
      where: { userId },
      include: { subcategory: true }
    });
  }

  async removeFavoriteSubcategory(userId: number, subcategoryId: number) {
    return this.prisma.userFavoriteSubcategory.delete({
      where: { userId_subcategoryId: { userId, subcategoryId } }
    });
  }

  async addBookmark(userId: number, postId: number) {
    return this.prisma.bookmark.create({
      data: { userId, postId }
    });
  }

  async getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: { post: { include: { author: true } } }
    });
  }

  async removeBookmark(userId: number, postId: number) {
    return this.prisma.bookmark.delete({
      where: { userId_postId: { userId, postId } }
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
          }
        },
        posts: {
          select: { likesCount: true }
        }
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const totalLikesReceived = user.posts.reduce((sum, p) => sum + p.likesCount, 0);

    return {
      postsCount: user._count.posts,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      likesCount: totalLikesReceived
    };
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) throw new ForbiddenException('Текущий пароль неверен');

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash: newHash }
    });
  }
}
