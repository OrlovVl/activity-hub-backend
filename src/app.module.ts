import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CommentsModule } from './modules/comments/comments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PostsModule,
    CategoriesModule,
    CommentsModule,
    NotificationsModule,
    SearchModule,
  ],
})
export class AppModule {}