import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) { }

  async globalSearch(query: string) {
    const [posts, users, subcategories] = await Promise.all([
      // Поиск по постам
      this.prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      // Поиск по пользователям
      this.prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      // Поиск по подкатегориям
      this.prisma.subcategory.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          isApproved: true,
        },
        take: 5,
      }),
    ]);

    return { posts, users, subcategories };
  }
}
