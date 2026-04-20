import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Category {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;
}
