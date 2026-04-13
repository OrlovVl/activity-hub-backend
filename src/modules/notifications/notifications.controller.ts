import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список уведомлений текущего пользователя',
  })
  async findAll(
    @GetUser('id') userId: number,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.getFullNotifications(
      userId,
      unreadOnly === 'true',
    );
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отметить уведомление как прочитанное' })
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    await this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Прочитать все уведомления' })
  async markAllAsRead(@GetUser('id') userId: number) {
    await this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить уведомление' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    await this.notificationsService.delete(id, userId);
  }
}
