import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService], // Экспортируем, если сервис нужен в других модулях
})
export class UsersModule {}