import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {

  // 1. Создаем пользователей разных ролей
  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      username: 'admin',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: Role.ADMIN,
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: 'moder@moder.com' },
    update: {},
    create: {
      email: 'moder@moder.com',
      username: 'moderator',
      passwordHash: await bcrypt.hash('moder123', 10),
      role: Role.MODERATOR,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@user.com' },
    update: {},
    create: {
      email: 'user@user.com',
      username: 'user',
      passwordHash: await bcrypt.hash('user123', 10),
      role: Role.USER,
      avatar: 'https://example.com/avatars/user.jpg',
      bio: 'Обожаю запах бензина по утрам',
    },
  });

  // 2. Создаем основную категорию
  const mainCategory = await prisma.mainCategory.upsert({
    where: { name: 'Транспорт' },
    update: {},
    create: {
      name: 'Транспорт',
      icon: 'shuttle-van',
    },
  });

  // 3. Создаем подкатегорию "Мото"
  const subcategory = await prisma.subcategory.upsert({
    where: {
      name_mainCategoryId: {
        name: 'Мотоциклы',
        mainCategoryId: mainCategory.id,
      },
    },
    update: {},
    create: {
      name: 'Мотоциклы',
      description: 'Байки, экипировка и покатушки',
      mainCategoryId: mainCategory.id,
      createdByUserId: user.id,
      isApproved: true,
    },
  });

  // 4. Создаем пост от обычного юзера
  await prisma.post.create({
    data: {
      title: 'Обзор моего нового Ducati Monster 2026',
      content: 'Ребята, это просто пушка! Управляемость на высоте, звук выхлопа заставляет прохожих оборачиваться. Проехал первые 500 км, делюсь впечатлениями...',
      subcategoryId: subcategory.id,
      authorId: user.id,
      tags: ['ducati', 'moto', 'review', '2026'],
      media: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87',
        alt: 'Red Ducati Motorcycle'
      },
      location: {
        city: 'Moscow',
        lat: 55.7558,
        lng: 37.6173,
        address: 'Sparrow Hills'
      },
      likesCount: 0, 
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });