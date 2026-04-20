import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';

@InputType()
export class CreatePostDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  content!: string;

  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  subcategoryId!: number;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  location?: string;
}