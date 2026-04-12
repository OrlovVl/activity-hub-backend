import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить данные своего профиля' })
  async getMe(@GetUser('id') userId: number) {
    return this.usersService.findOne(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить информацию о себе' })
  async updateMe(@GetUser('id') userId: number, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('me/bookmarks/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить пост в закладки' })
  async addBookmark(@GetUser('id') userId: number, @Param('id', ParseIntPipe) postId: number) {
    return this.usersService.addBookmark(userId, postId);
  }
}