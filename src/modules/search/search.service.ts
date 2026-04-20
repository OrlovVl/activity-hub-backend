import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string) {
    const searchString = query.trim().split(/\s+/).join(' & ');

    const [posts, users, subcategories] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { author: { select: { username: true } } },
        take: 15,
      }),

      this.prisma.user.findMany({
        where: { username: { contains: query, mode: 'insensitive' } },
        select: { id: true, username: true, bio: true },
        take: 5,
      }),

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