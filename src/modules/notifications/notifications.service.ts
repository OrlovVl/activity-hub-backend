import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) { }

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
      select: { username: true, avatar: true }
    });

    return this.prisma.notification.create({
      data: {
        ...data,
        sourceUserName: sourceUser?.username || 'Unknown',
        sourceUserAvatar: sourceUser?.avatar,
      },
    });
  }

  async getUserNotifications(userId: number, unreadOnly: boolean = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
    });
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
      data: { isRead: true }
    });
  }

  async delete(id: number, userId: number) {
    return this.prisma.notification.deleteMany({
      where: { id, userId }
    });
  }
}
