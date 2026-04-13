import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './models/post.model';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { GqlUser } from '../../common/decorators/gql-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersService } from '../users/users.service';

@Resolver(() => Post)
export class PostsResolver {
    constructor(
        private readonly postsService: PostsService,
        private readonly usersService: UsersService,
    ) { }

    @Query(() => [Post], { name: 'posts' })
    async findAll(
        @Args('subcategoryId', { type: () => Int, nullable: true }) subcategoryId: number | undefined,
        @GqlUser('id') userId: number | undefined,
        @Args('limit', { type: () => Int, defaultValue: 10 }) take: number,
    ) {
        return this.postsService.findAll({ subcategoryId, take }, userId);
    }

    @Query(() => Post, { name: 'post' })
    async findOne(
        @Args('id', { type: () => Int }) id: number,
        @GqlUser('id') userId?: number,
    ) {
        return this.postsService.findOne(id, userId);
    }

    @Mutation(() => Post)
    @UseGuards(GqlAuthGuard)
    async createPost(
        @GqlUser('id') userId: number,
        @Args('data') dto: CreatePostDto,
    ) {
        return this.postsService.create(userId, dto);
    }

    @Mutation(() => Post)
    @UseGuards(GqlAuthGuard)
    async updatePost(
        @Args('id', { type: () => Int }) id: number,
        @GqlUser('id') userId: number,
        @Args('data') dto: UpdatePostDto,
    ) {
        return this.postsService.update(id, userId, dto);
    }

    @Mutation(() => Boolean)
    @UseGuards(GqlAuthGuard)
    async deletePost(@Args('id', { type: () => Int }) id: number, @GqlUser('id') userId: number) {
        await this.postsService.delete(id, userId);
        return true;
    }

    @ResolveField()
    async author(@Parent() post: any) {
        return this.usersService.findOne(post.authorId);
    }
}