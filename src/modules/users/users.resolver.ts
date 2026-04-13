import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { GqlUser } from '../../common/decorators/gql-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  async getMe(@GqlUser('id') userId: number) {
    return this.usersService.findOne(userId);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateMe(
    @GqlUser('id') userId: number,
    @Args('data') dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async addBookmark(
    @GqlUser('id') userId: number,
    @Args('postId', { type: () => Int }) postId: number,
  ) {
    await this.usersService.addBookmark(userId, postId);
    return true;
  }

  @Query(() => [User], { name: 'users' })
  async findAll(
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('search', { nullable: true }) search?: string,
  ) {
    const res = await this.usersService.findAllUsers({ limit, search });
    return res.users;
  }
}
