import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreatePostDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() content: string;
  @IsNumber() @IsNotEmpty() subcategoryId: number;
  @IsArray() @IsOptional() tags?: string[];
  @IsObject() @IsOptional() media?: any;
  @IsObject() @IsOptional() location?: any;
}
