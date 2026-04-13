import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Post {
  @Field(() => Int)
  id!: number;

  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field(() => Int)
  likesCount!: number;

  @Field(() => User)
  author!: User;

  @Field()
  createdAt!: Date;
}