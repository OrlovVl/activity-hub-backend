import { Resolver, Query, Field, ObjectType } from '@nestjs/graphql';
import { PostsService } from '../posts/posts.service';
import { CategoriesService } from '../categories/categories.service';
import { UsersService } from '../users/users.service';
import { Post } from '../posts/models/post.model';
import { Category } from '../categories/models/category.model';
import { User } from '../users/models/user.model';
import { GqlUser } from '../../common/decorators/gql-user.decorator';

@ObjectType()
export class HomePageData {
  @Field(() => [Post])
  trendingPosts!: Post[];

  @Field(() => [Category])
  categories!: Category[];

  @Field(() => User, { nullable: true })
  me?: User;

  @Field(() => [User], { nullable: 'itemsAndList' })
  followedUsers!: User[];

  @Field(() => [User], { nullable: 'itemsAndList' })
  activeUsers!: User[];

  @Field(() => [Post], { nullable: 'itemsAndList' })
  subscribedPosts!: Post[];
}

@Resolver()
export class BffResolver {
  constructor(
    private postsService: PostsService,
    private categoriesService: CategoriesService,
    private usersService: UsersService,
  ) {}

  @Query(() => HomePageData)
  async getHomePage(@GqlUser('id') userId?: number) {
    // Выполняем запросы параллельно
    const [posts, categories, user, followedUsers, activeUsers, subscribedPosts] = await Promise.all([
      this.postsService.findAll({ take: 10 }, userId), // Топ-10 постов
      this.categoriesService.findAllMain(), // Все главные категории
      userId ? this.usersService.findOne(userId) : Promise.resolve(null),
      userId ? this.usersService.getFollowingUsers(userId) : Promise.resolve([]),
      userId ? this.usersService.getActiveUsers(20) : Promise.resolve([]),
      userId ? this.usersService.getSubscribedPosts(userId) : Promise.resolve([]),
    ]);

    return {
      trendingPosts: posts,
      categories: categories,
      me: user ?? undefined,
      followedUsers,
      activeUsers,
      subscribedPosts,
    };
  }
}
