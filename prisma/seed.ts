import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Создание пользователей
  const password1 = await bcrypt.hash('password1', 10);
  const password2 = await bcrypt.hash('password2', 10);
  const password3 = await bcrypt.hash('password3', 10);

  const users = await prisma.user.createMany({
    data: [
      {
        username: 'ivanov_ivan',
        email: 'ivanov@example.com',
        passwordHash: password1,
        role: Role.ADMIN,
      },
      {
        username: 'petrov_petr',
        email: 'petrov@example.com',
        passwordHash: password2,
        role: Role.USER,
      },
      {
        username: 'sidorov_sidor',
        email: 'sidorov@example.com',
        passwordHash: password3,
        role: Role.USER,
      },
    ],
  });

  // Создание основных категорий
  const mainCategories = await prisma.mainCategory.createMany({
    data: [
      { name: 'Программирование' },
      { name: 'Спорт' },
      { name: 'Музыка' },
      { name: 'Путешествия' },
      { name: 'Кулинария' },
      { name: 'Наука' },
    ],
  });

  // Создание подкатегорий
  const subcategories = await prisma.subcategory.createMany({
    data: [
      { name: 'JavaScript', description: 'JavaScript и его экосистема', mainCategoryId: 1, createdByUserId: 1, tags: ['frontend', 'backend'], isApproved: true },
      { name: 'Python', description: 'Python для начинающих и продвинутых', mainCategoryId: 1, createdByUserId: 1, tags: ['backend', 'data'], isApproved: true },
      { name: 'React', description: 'React и современные фреймворки', mainCategoryId: 1, createdByUserId: 1, tags: ['frontend'], isApproved: true },
      { name: 'Футбол', description: 'Новости футбола и аналитика', mainCategoryId: 2, createdByUserId: 2, tags: ['team sports'], isApproved: true },
      { name: 'Бег', description: 'Бег на длинные и короткие дистанции', mainCategoryId: 2, createdByUserId: 2, tags: ['individual sports'], isApproved: true },
      { name: 'Рок', description: 'Рок музыка всех эпох', mainCategoryId: 3, createdByUserId: 3, tags: ['classic rock'], isApproved: true },
      { name: 'Джаз', description: 'Джаз и блюз', mainCategoryId: 3, createdByUserId: 3, tags: ['jazz'], isApproved: true },
      { name: 'Париж', description: 'Путеводитель по Парижу', mainCategoryId: 4, createdByUserId: 1, tags: ['europe'], isApproved: true },
      { name: 'Токио', description: 'Путеводитель по Токио', mainCategoryId: 4, createdByUserId: 1, tags: ['asia'], isApproved: true },
      { name: 'Блюда', description: 'Рецепты основных блюд', mainCategoryId: 5, createdByUserId: 2, tags: ['main'], isApproved: true },
      { name: 'Выпечка', description: 'Десерты и выпечка', mainCategoryId: 5, createdByUserId: 2, tags: ['dessert'], isApproved: true },
      { name: 'Квантовая физика', description: 'Квантовая механика и теория', mainCategoryId: 6, createdByUserId: 3, tags: ['physics'], isApproved: true },
      { name: 'Биология', description: 'Биология и жизнь', mainCategoryId: 6, createdByUserId: 3, tags: ['life sciences'], isApproved: true },
    ],
  });

  // Создание подписок
  const follows = await prisma.follow.createMany({
    data: [
      { followerId: 2, followingId: 1 },
      { followerId: 3, followingId: 1 },
      { followerId: 3, followingId: 2 },
    ],
  });

  // Создание постов
  const posts = await prisma.post.createMany({
    data: [
      {
        title: 'Как начать изучать JavaScript',
        content: 'JavaScript — это язык программирования, который используется для создания интерактивных веб-страниц. Начните с основ синтаксиса и постепенно переходите к более сложным темам.',
        tags: ['beginner', 'tutorial'],
        subcategoryId: 1,
        authorId: 1
      },
      {
        title: 'Польза бега для здоровья',
        content: 'Бег — это отличный способ поддерживать форму и укреплять сердечно-сосудистую систему. Начните с коротких дистанций и постепенно увеличивайте нагрузку.',
        tags: ['health', 'fitness'],
        subcategoryId: 4,
        authorId: 2
      },
      {
        title: 'История джаза',
        content: 'Джаз — это музыкальный жанр, который зародился в начале 20 века в Новом Орлеане. Узнайте больше о его развитии и знаменитых исполнителях.',
        tags: ['music', 'history'],
        subcategoryId: 6,
        authorId: 3
      },
      {
        title: 'Что посмотреть в Париже',
        content: 'Париж — город света искусств и культуры. Обязательно посетите Эйфелеву башню, Лувр и Мулен Руж.',
        tags: ['travel', 'guide'],
        subcategoryId: 8,
        authorId: 1
      },
      {
        title: 'Рецепт идеального борща',
        content: 'Борщ — это традиционное блюдо славянских народов. Секрет идеального борща — в правильном соотношении ингредиентов и длительном тушении.',
        tags: ['recipe', 'food'],
        subcategoryId: 11,
        authorId: 2
      },
      {
        title: 'Основы квантовой механики',
        content: 'Квантовая механика — это раздел физики, изучающий поведение материи и энергии на атомном и субатомном уровнях.',
        tags: ['science', 'physics'],
        subcategoryId: 12,
        authorId: 3
      },
    ],
  });

  console.log('Тестовые данные созданы');
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });