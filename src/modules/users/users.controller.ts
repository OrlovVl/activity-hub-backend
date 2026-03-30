import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe() {
    const userId = 1; // Заглушка
    return this.usersService.findOne(userId);
  }

  @Put('me')
  async updateMe(@Body() dto: UpdateUserDto) {
    const userId = 1; // Заглушка
    return this.usersService.updateProfile(userId, dto);
  }

  @Put('me/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() dto: ChangePasswordDto) {
    const userId = 1; // Заглушка
    await this.usersService.changePassword(userId, dto);
  }

  @Get()
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('search') search?: string,
  ) {
    // В сервисе нужно будет добавить метод findAllUsers с пагинацией и поиском
    return this.usersService.findAllUsers({ limit, offset, search });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post(':id/follow')
  @HttpCode(HttpStatus.OK)
  async follow(@Param('id', ParseIntPipe) id: number) {
    const userId = 1; // Заглушка
    await this.usersService.follow(userId, id);
  }

  @Delete(':id/follow')
  @HttpCode(HttpStatus.OK)
  async unfollow(@Param('id', ParseIntPipe) id: number) {
    const userId = 1; // Заглушка
    await this.usersService.unfollow(userId, id);
  }

  // 4.4 Bookmarks
  @Post('me/bookmarks/:id')
  @HttpCode(HttpStatus.OK)
  async addBookmark(@Param('id', ParseIntPipe) postId: number) {
    return this.usersService.addBookmark(1, postId);
  }

  @Delete('me/bookmarks/:id')
  @HttpCode(HttpStatus.OK)
  async removeBookmark(@Param('id', ParseIntPipe) postId: number) {
    return this.usersService.removeBookmark(1, postId);
  }

  @Get('me/bookmarks')
  async getBookmarks() {
    return this.usersService.getBookmarks(1);
  }

  // 4.6 Favorite Subcategories
  @Post('me/favorites/subcategories/:subcategoryId')
  @HttpCode(HttpStatus.OK)
  async addFavoriteSub(@Param('subcategoryId', ParseIntPipe) subId: number) {
    return this.usersService.addFavoriteSubcategory(1, subId);
  }

  @Delete('me/favorites/subcategories/:subcategoryId')
  @HttpCode(HttpStatus.OK)
  async removeFavoriteSub(@Param('subcategoryId', ParseIntPipe) subId: number) {
    return this.usersService.removeFavoriteSubcategory(1, subId);
  }
}