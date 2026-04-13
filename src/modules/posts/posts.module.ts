import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsResolver } from './posts.resolver';
import { UsersModule } from '../users/users.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [UsersModule, FilesModule],
  controllers: [PostsController],
  providers: [PostsService, PostsResolver],
  exports: [PostsService],
})
export class PostsModule {}
