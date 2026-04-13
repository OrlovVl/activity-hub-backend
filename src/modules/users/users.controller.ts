import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiOperation({ summary: 'Список пользователей' })
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAllUsers({
      limit: limit ? +limit : undefined,
      offset: offset ? +offset : undefined,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Профиль пользователя' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить данные своего профиля' })
  async getMe(@GetUser('id') userId: number) {
    const me = await this.usersService.findOne(userId);
    const stats = await this.usersService.getProfileStats(userId);
    const favorites = await this.usersService.getFavoriteSubcategories(userId);
    return {
      ...me,
      favoriteSubcategoryIds: favorites.map((f) => f.subcategoryId),
      stats,
    };
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить информацию о себе' })
  async updateMe(@GetUser('id') userId: number, @Body() dto: UpdateUserDto) {
    await this.usersService.updateProfile(userId, dto);
    return this.getMe(userId);
  }

  @Get('me/favorites/subcategories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Избранные подкатегории' })
  async getFavorites(@GetUser('id') userId: number) {
    const rows = await this.usersService.getFavoriteSubcategories(userId);
    return rows.map((r) => r.subcategory);
  }

  @Post('me/favorites/subcategories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить подкатегорию в избранное' })
  async addFavorite(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) subcategoryId: number,
  ) {
    return this.usersService.addFavoriteSubcategory(userId, subcategoryId);
  }

  @Delete('me/favorites/subcategories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить подкатегорию из избранного' })
  async removeFavorite(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) subcategoryId: number,
  ) {
    return this.usersService.removeFavoriteSubcategory(userId, subcategoryId);
  }

  @Post('me/bookmarks/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить пост в закладки' })
  async addBookmark(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    return this.usersService.addBookmark(userId, postId);
  }

  @Get('me/bookmarks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список закладок' })
  async getBookmarks(@GetUser('id') userId: number) {
    const rows = await this.usersService.getBookmarks(userId);
    const posts = rows.map((r) => r.post);
    return { posts, total: posts.length };
  }

  @Delete('me/bookmarks/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить пост из закладок' })
  async removeBookmark(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    return this.usersService.removeBookmark(userId, postId);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Подписаться на пользователя' })
  async follow(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) followingId: number,
  ) {
    return this.usersService.follow(userId, followingId);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отписаться от пользователя' })
  async unfollow(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) followingId: number,
  ) {
    return this.usersService.unfollow(userId, followingId);
  }
}
