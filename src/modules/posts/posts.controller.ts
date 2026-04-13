import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('posts') // Группа в Swagger
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех постов с фильтрацией' })
  async findAll(@Query() query: any, @GetUser('id') userId?: number) {
    // userId подтянется автоматически, если токен передан
    return this.postsService.findAll(query, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth() // Показывает в Swagger, что нужен токен
  @ApiOperation({ summary: 'Создать новый пост' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        subcategoryId: { type: 'number' },
        tags: {
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } },
          ],
        },
        media: { type: 'string', description: 'JSON string (optional)' },
        location: { type: 'string', description: 'JSON string (optional)' },
        photo: { type: 'string', format: 'binary' },
      },
      required: ['title', 'content', 'subcategoryId'],
    },
  })
  async create(
    @GetUser('id') userId: number,
    @UploadedFile() photo: Express.Multer.File | undefined,
    @Body() dto: any,
  ) {
    return this.postsService.create(userId, dto as CreatePostDto, photo);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить существующий пост (только для автора)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить пост' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    await this.postsService.delete(id, userId);
  }
}
