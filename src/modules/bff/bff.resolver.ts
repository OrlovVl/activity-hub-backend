import { Resolver, Query, Field, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { CategoriesService } from '../categories/categories.service';
import { UsersService } from '../users/users.service';
import { Post } from '../posts/models/post.model';
import { Category } from '../categories/models/category.model'; // Предположим, модель так называется
import { User } from '../users/models/user.model';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { GqlUser } from '../../common/decorators/gql-user.decorator';

@ObjectType()
export class HomePageData {
  @Field(() => [Post])
  trendingPosts!: Post[];

  @Field(() => [Category])
  categories!: Category[];

  @Field(() => User, { nullable: true })
  me?: User;
}

@Resolver()
export class BffResolver {
  constructor(
    private postsService: PostsService,
    private categoriesService: CategoriesService,
    private usersService: UsersService,
  ) {}

  @Query(() => HomePageData)
  @UseGuards(GqlAuthGuard)
  async getHomePage(@GqlUser('id') userId: number) {
    // Выполняем запросы параллельно
    const [posts, categories, user] = await Promise.all([
      this.postsService.findAll({ take: 10 }), // Топ-10 постов
      this.categoriesService.findAllMain(), // Все главные категории
      this.usersService.findOne(userId), // Данные юзера
    ]);

    return {
      trendingPosts: posts,
      categories: categories,
      me: user,
    };
  }
}
