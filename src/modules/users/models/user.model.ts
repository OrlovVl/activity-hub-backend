import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

registerEnumType(Role, { name: 'Role' });

@ObjectType()
export class UserStats {
  @Field(() => Int)
  postsCount!: number;

  @Field(() => Int)
  followersCount!: number;

  @Field(() => Int)
  followingCount!: number;

  @Field(() => Int)
  likesCount!: number;
}

@ObjectType()
export class User {
  @Field(() => Int)
  id!: number;

  @Field()
  email!: string;

  @Field()
  username!: string;

  @Field()
  bio?: string;

  @Field()
  avatar?: string;

  @Field(() => Role)
  role!: Role;

  @Field()
  createdAt!: Date;

  @Field(() => [Int], { nullable: 'itemsAndList' })
  favoriteSubcategoryIds!: number[];

  @Field(() => [Int], { nullable: 'itemsAndList' })
  following!: number[];

  @Field(() => UserStats, { nullable: true })
  stats?: UserStats;
}