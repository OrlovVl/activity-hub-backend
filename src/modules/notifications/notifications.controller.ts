import { Controller, Get, Patch, Delete, Param, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

@Get()
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const userId = 1;
    return this.notificationsService.getFullNotifications(userId, unreadOnly === 'true');
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    await this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead() {
    const userId = 1; // Заглушка
    await this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const userId = 1; // Заглушка
    await this.notificationsService.delete(id, userId);
  }
}