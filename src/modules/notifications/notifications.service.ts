import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  @OnEvent('notification.create')
  async handleNotificationCreate(payload: any) {
    await this.createNotification(payload);
  }

  @OnEvent('post.created')
  async handlePostCreated(payload: {
    postId: number;
    authorId: number;
    authorName: string;
    title: string;
  }) {
    const followers = await this.prisma.follow.findMany({
      where: { followingId: payload.authorId },
    });

    if (followers.length === 0) return;

    await this.prisma.notification.createMany({
      data: followers.map((f) => ({
        type: 'FOLLOW' as NotificationType,
        userId: f.followerId,
        sourceUserId: payload.authorId,
        sourceUserName: payload.authorName,
        message: `опубликовал новый пост: ${payload.title}`,
        postId: payload.postId,
      })),
    });
  }

  async createNotification(data: {
    type: NotificationType;
    userId: number;
    sourceUserId: number;
    message: string;
    postId?: number;
    commentId?: number;
  }) {
    const sourceUser = await this.prisma.user.findUnique({
      where: { id: data.sourceUserId },
      select: { username: true },
    });

    return this.prisma.notification.create({
      data: {
        ...data,
        sourceUserName: sourceUser?.username || 'Система',
      },
    });
  }

  async getFullNotifications(userId: number, isUnread: boolean) {
    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId, ...(isUnread ? { isRead: false } : {}) },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { notifications, total, unreadCount };
  }

  async markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: number, userId: number) {
    return this.prisma.notification.delete({ where: { id, userId } });
  }
}