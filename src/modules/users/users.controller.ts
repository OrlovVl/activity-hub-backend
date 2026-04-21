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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

// DTO для stats
export class UserStatsDTO {
  postsCount!: number;
  followersCount!: number;
  followingCount!: number;
  likesCount!: number;
}

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
  @ApiOkResponse({ type: Object, description: 'Профиль пользователя со stats' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    const stats = await this.usersService.getUserStats(id);
    const followingIds = await this.usersService.getFollowingIds(id);
    return {
      ...user,
      stats,
      followingCount: stats.followingCount,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить данные своего профиля' })
  async getMe(@GetUser('id') userId: number) {
    const me = await this.usersService.findOne(userId);
    const stats = await this.usersService.getUserStats(userId);
    const favorites = await this.usersService.getFavoriteSubcategories(userId);
    const followingIds = await this.usersService.getFollowingIds(userId);
    return {
      ...me,
      favoriteSubcategoryIds: favorites.map((f) => f.subcategoryId),
      stats,
      following: followingIds,
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
  @ApiOkResponse({ type: Object, description: 'Результат подписки' })
  async follow(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) followingId: number,
  ) {
    const result = await this.usersService.follow(userId, followingId);
    return { followed: result.followed };
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отписаться от пользователя' })
  @ApiOkResponse({ type: Object, description: 'Результат отписки' })
  async unfollow(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) followingId: number,
  ) {
    const result = await this.usersService.unfollow(userId, followingId);
    return { followed: result.followed };
  }

  @Get('me/following')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список ID пользователей, на которые подписан текущий пользователь' })
  @ApiOkResponse({ type: [Number], description: 'Массив ID пользователей' })
  async getFollowing(@GetUser('id') userId: number) {
    const followingIds = await this.usersService.getFollowingIds(userId);
    return { following: followingIds };
  }

  @Get('me/following/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Проверить подписку на конкретного пользователя' })
  @ApiOkResponse({ type: Boolean, description: 'Подписан ли текущий пользователь на указанного' })
  async checkFollowing(
    @GetUser('id') userId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
  ) {
    const isFollowing = await this.usersService.isFollowing(userId, targetUserId);
    return { isFollowing };
  }
}
