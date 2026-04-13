import { Module } from '@nestjs/common';
import { BffResolver } from './bff.resolver';
import { PostsModule } from '../posts/posts.module';
import { CategoriesModule } from '../categories/categories.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PostsModule, CategoriesModule, UsersModule],
  providers: [BffResolver],
})
export class BffModule {}
