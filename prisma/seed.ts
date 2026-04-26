import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    console.log(` БД уже заполнена. Найдено ${userCount} пользователей. Пропускаем сид.`);
    return;
  }

  const users = await prisma.user.createMany({
    data: [
      {
        username: 'admin',
        email: 'admin@admin.com',
        passwordHash: await bcrypt.hash('admin@12345', 10),
        role: Role.ADMIN,
        bio: 'Администратор платформы Activity Hub',
      },
      {
        username: 'ivanov_user',
        email: 'ivanov@user.com',
        passwordHash: await bcrypt.hash('user@12345', 10),
        role: Role.USER,
        bio: 'Любитель путешествий и фотографии',
      },
      {
        username: 'petrova_user',
        email: 'petrova@user.com',
        passwordHash: await bcrypt.hash('user@12345', 10),
        role: Role.USER,
        bio: 'Разработчик и любитель книг',
      },
      {
        username: 'sidorov_promo',
        email: 'sidorov@example.com',
        passwordHash: await bcrypt.hash('user@12345', 10),
        role: Role.USER,
        bio: 'Спортсмен и ЗОЖ',
      },
      {
        username: 'kuzneova_admin',
        email: 'kuznetsova@example.com',
        passwordHash: await bcrypt.hash('user@12345', 10),
        role: Role.USER,
        bio: 'Новый пользователь',
      },
    ],
  });

  // Создание основных категорий (всевозможные темы для приложения Activity Hub)
  const mainCategories = await prisma.mainCategory.createMany({
    data: [
      // Технологии
      { name: 'Программирование' },
      { name: 'Искусственный интеллект' },
      { name: 'Кибербезопасность' },
      { name: 'Гаджеты и технологии' },

      // Спорт и здоровье
      { name: 'Спорт' },
      { name: 'Фитнес и тренировочки' },
      { name: 'Здоровье и ЗОЖ' },
      { name: 'Йога и медитация' },

      // Творчество и искусство
      { name: 'Музыка' },
      { name: 'Фотография' },
      { name: 'Рисование' },
      { name: 'Литература и книги' },
      { name: 'Кино и сериалы' },
      { name: 'Театр' },

      // Путешествия и природа
      { name: 'Путешествия' },
      { name: 'Природа и экология' },
      { name: 'Горы и альпинизм' },
      { name: 'Океан и дайвинг' },

      // Кулинария
      { name: 'Кулинария' },
      { name: 'Выпечка и десерты' },
      { name: 'Вино и коктейли' },

      // Наука и образование
      { name: 'Наука' },
      { name: 'История' },
      { name: 'Философия' },
      { name: 'Языки' },

      // Хобби и рукоделие
      { name: 'Хобби и рукоделие' },
      { name: 'Вязание и шитье' },
      { name: 'Деревообработка' },
      { name: 'Рыбалка и охота' },

      // Авто и транспорт
      { name: 'Автомобили' },
      { name: 'Велоспорт' },

      // Бизнес и карьера
      { name: 'Бизнес и стартапы' },
      { name: 'Карьера и развитие' },
      { name: 'Инвестиции и финансы' },

      // Образование
      { name: 'Образование' },
      { name: 'Самообразование' },

      // Игры
      { name: 'Видеоигры' },
      { name: 'Настольные игры' },

      // Дом и сад
      { name: 'Дом и сад' },
      { name: 'Дизайн интерьера' },

      // Мода и стиль
      { name: 'Мода и стиль' },
      { name: 'Красота и уход' },

      // Психология
      { name: 'Психология' },
      { name: 'Самопознание' },
    ],
  });

  // Создание подкатегорий без tags
  const subcategories = await prisma.subcategory.createMany({
    data: [
      // === Программирование ===
      { name: 'JavaScript', description: 'JavaScript и его экосистема: Node.js, React, Vue, Angular', mainCategoryId: 1, createdByUserId: 1, isApproved: true },
      { name: 'Python', description: 'Python для веб-разработки, data science и автоматизации', mainCategoryId: 1, createdByUserId: 1, isApproved: true },
      { name: 'Go', description: 'Язык программирования Go от Google', mainCategoryId: 1, createdByUserId: 1, isApproved: true },
      { name: 'Rust', description: 'Системное программирование на Rust', mainCategoryId: 1, createdByUserId: 2, isApproved: true },
      { name: 'Java', description: 'Java для enterprise-разработки и Android', mainCategoryId: 1, createdByUserId: 2, isApproved: true },
      { name: 'C# и .NET', description: 'Microsoft экосистема: ASP.NET, Unity, WPF', mainCategoryId: 1, createdByUserId: 3, isApproved: true },
      { name: 'Swift', description: 'Разработка для iOS и macOS', mainCategoryId: 1, createdByUserId: 3, isApproved: true },
      { name: 'Kotlin', description: 'Современная разработка для Android', mainCategoryId: 1, createdByUserId: 1, isApproved: true },
      { name: 'TypeScript', description: 'Типизированный JavaScript для больших проектов', mainCategoryId: 1, createdByUserId: 1, isApproved: true },
      { name: 'SQL и базы данных', description: 'PostgreSQL, MySQL, SQLite и другие СУБД', mainCategoryId: 1, createdByUserId: 2, isApproved: true },
      { name: 'DevOps', description: 'CI/CD, Docker, Kubernetes, облачные платформы', mainCategoryId: 1, createdByUserId: 2, isApproved: true },
      { name: 'Мобильная разработка', description: 'React Native, Flutter, iOS и Android native', mainCategoryId: 1, createdByUserId: 3, isApproved: true },
      { name: 'Game Development', description: 'Разработка игр на Unity, Unreal Engine и других движках', mainCategoryId: 1, createdByUserId: 1, isApproved: true },
      { name: 'Web-дизайн и фронтенд', description: 'HTML, CSS, анимации, адаптивная верстка', mainCategoryId: 1, createdByUserId: 3, isApproved: true },
      { name: 'Бэкенд-разработка', description: 'API, микросервисы, серверная логика', mainCategoryId: 1, createdByUserId: 2, isApproved: true },

      // === Искусственный интеллект ===
      { name: 'Machine Learning', description: 'Машинное обучение и алгоритмы', mainCategoryId: 2, createdByUserId: 1, isApproved: true },
      { name: 'Deep Learning', description: 'Глубокие нейронные сети: TensorFlow, PyTorch', mainCategoryId: 2, createdByUserId: 1, isApproved: true },
      { name: 'NLP', description: 'Обработка естественного языка', mainCategoryId: 2, createdByUserId: 2, isApproved: true },
      { name: 'Компьютерное зрение', description: 'Распознавание изображений и видео', mainCategoryId: 2, createdByUserId: 2, isApproved: true },
      { name: 'AI генерация контента', description: 'GPT, DALL-E, Stable Diffusion и другие генеративные модели', mainCategoryId: 2, createdByUserId: 3, isApproved: true },
      { name: 'AI для бизнеса', description: 'Автоматизация, аналитика, чат-боты', mainCategoryId: 2, createdByUserId: 3, isApproved: true },

      // === Кибербезопасность ===
      { name: 'Пентестинг', description: 'Тестирование на проникновение и ethical hacking', mainCategoryId: 3, createdByUserId: 1, isApproved: true },
      { name: 'Защита данных', description: 'Шифрование, приватность, GDPR', mainCategoryId: 3, createdByUserId: 2, isApproved: true },
      { name: 'Сетевая безопасность', description: 'Firewalls, IDS/IPS, защита инфраструктуры', mainCategoryId: 3, createdByUserId: 3, isApproved: true },
      { name: 'Application Security', description: 'Безопасность веб-приложений: OWASP Top 10', mainCategoryId: 3, createdByUserId: 1, isApproved: true },

      // === Гаджеты и технологии ===
      { name: 'Смартфоны', description: 'Обзоры и сравнения смартфонов', mainCategoryId: 4, createdByUserId: 2, isApproved: true },
      { name: 'Ноутбуки', description: 'Выбор ноутбуков для работы и игр', mainCategoryId: 4, createdByUserId: 3, isApproved: true },
      { name: 'Умный дом', description: 'IoT устройства и автоматизация дома', mainCategoryId: 4, createdByUserId: 1, isApproved: true },
      { name: 'VR/AR технологии', description: 'Виртуальная и дополненная реальность', mainCategoryId: 4, createdByUserId: 2, isApproved: true },

      // === Спорт ===
      { name: 'Футбол', description: 'Новости футбола, аналитика матчей', mainCategoryId: 5, createdByUserId: 3, isApproved: true },
      { name: 'Баскетбол', description: 'NBA, европейский баскетбол', mainCategoryId: 5, createdByUserId: 1, isApproved: true },
      { name: 'Теннис', description: 'Теннисные турниры и техника', mainCategoryId: 5, createdByUserId: 2, isApproved: true },
      { name: 'Плавание', description: 'Техника плавания, соревнования', mainCategoryId: 5, createdByUserId: 3, isApproved: true },
      { name: 'Бокс и ММА', description: 'Единоборства, тренировки, турниры', mainCategoryId: 5, createdByUserId: 1, isApproved: true },
      { name: 'Велоспорт', description: 'Велопрогулки, шоссейные гонки', mainCategoryId: 5, createdByUserId: 2, isApproved: true },
      { name: 'Бег', description: 'Марафоны, спринт, техника бега', mainCategoryId: 5, createdByUserId: 3, isApproved: true },
      { name: 'Йога', description: 'Йога для гибкости и баланса', mainCategoryId: 5, createdByUserId: 1, isApproved: true },
      { name: 'Силовые тренировки', description: 'Пауэрлифтинг, бодибилдинг', mainCategoryId: 5, createdByUserId: 2, isApproved: true },
      { name: 'Кроссфит', description: 'Функциональные тренировки высокой интенсивности', mainCategoryId: 5, createdByUserId: 3, isApproved: true },

      // === Фитнес ===
      { name: 'Домашний фитнес', description: 'Тренировки без оборудования', mainCategoryId: 6, createdByUserId: 1, isApproved: true },
      { name: 'Кардио тренировки', description: 'Эффективные кардио программы', mainCategoryId: 6, createdByUserId: 2, isApproved: true },
      { name: 'Растяжка', description: 'Гибкость, мобильность суставов', mainCategoryId: 6, createdByUserId: 3, isApproved: true },
      { name: 'HIIT', description: 'Высокоинтенсивные интервальные тренировки', mainCategoryId: 6, createdByUserId: 1, isApproved: true },
      { name: 'Пилатес', description: 'Контрология для укрепления кора', mainCategoryId: 6, createdByUserId: 2, isApproved: true },

      // === Здоровье и ЗОЖ ===
      { name: 'Питание и диеты', description: 'Сбалансированное питание, ПП', mainCategoryId: 7, createdByUserId: 3, isApproved: true },
      { name: 'Ментальное здоровье', description: 'Борьба со стрессом, тревожностью', mainCategoryId: 7, createdByUserId: 1, isApproved: true },
      { name: 'Сон и восстановление', description: 'Качественный сон, отдых', mainCategoryId: 7, createdByUserId: 2, isApproved: true },
      { name: 'Витамины и минералы', description: 'Нутрицевтика, добавки', mainCategoryId: 7, createdByUserId: 3, isApproved: true },
      { name: 'Народная медицина', description: 'Травы, природные средства', mainCategoryId: 7, createdByUserId: 1, isApproved: true },

      // === Йога и медитация ===
      { name: 'Хатха-йога', description: 'Классическая хатха-йога', mainCategoryId: 8, createdByUserId: 2, isApproved: true },
      { name: 'Виньяса-йога', description: 'Динамичная практика виньясы', mainCategoryId: 8, createdByUserId: 3, isApproved: true },
      { name: 'Медитация', description: 'Техники медитации для начинающих', mainCategoryId: 8, createdByUserId: 1, isApproved: true },
      { name: 'Пранаяма', description: 'Дыхательные практики', mainCategoryId: 8, createdByUserId: 2, isApproved: true },

      // === Музыка ===
      { name: 'Гитара', description: 'Акустическая и электрогитара', mainCategoryId: 9, createdByUserId: 3, isApproved: true },
      { name: 'Пианино', description: 'Клавишные инструменты', mainCategoryId: 9, createdByUserId: 1, isApproved: true },
      { name: 'Вокал', description: 'Техники пения и вокальные упражнения', mainCategoryId: 9, createdByUserId: 2, isApproved: true },
      { name: 'Музыкальное производство', description: 'Запись, сведение, мастеринг', mainCategoryId: 9, createdByUserId: 3, isApproved: true },
      { name: 'DJ', description: 'Скретч, микширование, сеты', mainCategoryId: 9, createdByUserId: 1, isApproved: true },
      { name: 'Рок', description: 'Рок музыка всех эпох', mainCategoryId: 9, createdByUserId: 2, isApproved: true },
      { name: 'Джаз', description: 'Джаз и блюз', mainCategoryId: 9, createdByUserId: 3, isApproved: true },
      { name: 'Электронная музыка', description: 'EDM, techno, house, ambient', mainCategoryId: 9, createdByUserId: 1, isApproved: true },
      { name: 'Музыковедение', description: 'Теория музыки, сольфеджио', mainCategoryId: 9, createdByUserId: 2, isApproved: true },

      // === Фотография ===
      { name: 'Пейзажная фотография', description: 'Съёмка природы и ландшафтов', mainCategoryId: 10, createdByUserId: 3, isApproved: true },
      { name: 'Портретная фотография', description: 'Техники портретной съёмки', mainCategoryId: 10, createdByUserId: 1, isApproved: true },
      { name: 'Макросъёмка', description: 'Крупные планы объектов', mainCategoryId: 10, createdByUserId: 2, isApproved: true },
      { name: 'Фоторетушь', description: 'Lightroom, Photoshop обработка', mainCategoryId: 10, createdByUserId: 3, isApproved: true },
      { name: 'Видеосъёмка', description: 'Съёмка видео, монтаж', mainCategoryId: 10, createdByUserId: 1, isApproved: true },

      // === Рисование ===
      { name: 'Акварель', description: 'Техники акварельной живописи', mainCategoryId: 11, createdByUserId: 2, isApproved: true },
      { name: 'Масло', description: 'Масляная живопись', mainCategoryId: 11, createdByUserId: 3, isApproved: true },
      { name: 'Скетчинг', description: 'Быстрые зарисовки карандашом и маркерами', mainCategoryId: 11, createdByUserId: 1, isApproved: true },
      { name: 'Цифровое рисование', description: 'Procreate, Photoshop для иллюстрации', mainCategoryId: 11, createdByUserId: 2, isApproved: true },
      { name: 'Иллюстрация', description: 'Книжная и коммерческая иллюстрация', mainCategoryId: 11, createdByUserId: 3, isApproved: true },
      { name: 'Каллиграфия', description: 'Искусство красивого письма', mainCategoryId: 11, createdByUserId: 1, isApproved: true },

      // === Литература и книги ===
      { name: 'Фантастика', description: 'Научная фантастика и фэнтези', mainCategoryId: 12, createdByUserId: 2, isApproved: true },
      { name: 'Классика', description: 'Мировая классическая литература', mainCategoryId: 12, createdByUserId: 3, isApproved: true },
      { name: 'Саморазвитие', description: 'Бизнес-литература и мотивация', mainCategoryId: 12, createdByUserId: 1, isApproved: true },
      { name: 'Детективы', description: 'Детективные романы и новеллы', mainCategoryId: 12, createdByUserId: 2, isApproved: true },
      { name: 'Поэзия', description: 'Современная и классическая поэзия', mainCategoryId: 12, createdByUserId: 3, isApproved: true },
      { name: 'Книжный клуб', description: 'Обсуждение прочитанного, рекомендации', mainCategoryId: 12, createdByUserId: 1, isApproved: true },
      { name: 'Написание книг', description: 'Советы по написанию и публикации', mainCategoryId: 12, createdByUserId: 2, isApproved: true },

      // === Кино и сериалы ===
      { name: 'Обзоры фильмов', description: 'Рецензии на новинки кино', mainCategoryId: 13, createdByUserId: 3, isApproved: true },
      { name: 'Сериалы', description: 'Обсуждение сериалов', mainCategoryId: 13, createdByUserId: 1, isApproved: true },
      { name: 'Аниме', description: 'Японская анимация и манга', mainCategoryId: 13, createdByUserId: 2, isApproved: true },
      { name: 'Документальное кино', description: 'Документальные фильмы и сериалы', mainCategoryId: 13, createdByUserId: 3, isApproved: true },
      { name: 'Видеоблогинг', description: 'Создание YouTube контента', mainCategoryId: 13, createdByUserId: 1, isApproved: true },

      // === Театр ===
      { name: 'Драма', description: 'Театральные постановки', mainCategoryId: 14, createdByUserId: 2, isApproved: true },
      { name: 'Комедия', description: 'Юмористические спектакли', mainCategoryId: 14, createdByUserId: 3, isApproved: true },
      { name: 'Кукольный театр', description: 'Артисты и спектакли', mainCategoryId: 14, createdByUserId: 1, isApproved: true },

      // === Путешествия ===
      { name: 'Европа', description: 'Путеводители по странам Европы', mainCategoryId: 15, createdByUserId: 2, isApproved: true },
      { name: 'Азия', description: 'Страны Азии: Китай, Япония, Таиланд', mainCategoryId: 15, createdByUserId: 3, isApproved: true },
      { name: 'Америка', description: 'США, Канада, Латинская Америка', mainCategoryId: 15, createdByUserId: 1, isApproved: true },
      { name: 'Африка', description: 'Сафари и путешествия по Африке', mainCategoryId: 15, createdByUserId: 2, isApproved: true },
      { name: 'Океания', description: 'Австралия, Новая Зеландия', mainCategoryId: 15, createdByUserId: 3, isApproved: true },
      { name: 'Бюджетные путешествия', description: 'Хостелы, рюкзачный туризм', mainCategoryId: 15, createdByUserId: 1, isApproved: true },
      { name: 'Luxury путешествия', description: 'Элитные курорты и туры', mainCategoryId: 15, createdByUserId: 2, isApproved: true },
      { name: 'Треккинг', description: 'Пешие походы по горным маршрутам', mainCategoryId: 15, createdByUserId: 3, isApproved: true },
      { name: 'Круизы', description: 'Морские и речные круизы', mainCategoryId: 15, createdByUserId: 1, isApproved: true },

      // === Природа и экология ===
      { name: 'Эко-образ жизни', description: 'Zero waste, осознанное потребление', mainCategoryId: 16, createdByUserId: 2, isApproved: true },
      { name: 'Ботаника', description: 'Изучение растений', mainCategoryId: 16, createdByUserId: 3, isApproved: true },
      { name: 'Орнитология', description: 'Наблюдение за птицами', mainCategoryId: 16, createdByUserId: 1, isApproved: true },
      { name: 'Экологические проекты', description: 'Инициативы по защите окружающей среды', mainCategoryId: 16, createdByUserId: 2, isApproved: true },

      // === Горы и альпинизм ===
      { name: 'Альпинизм', description: 'Покорение высоких вершин', mainCategoryId: 17, createdByUserId: 3, isApproved: true },
      { name: 'Скалолазание', description: 'Искусственные и натуральные стенки', mainCategoryId: 17, createdByUserId: 1, isApproved: true },
      { name: 'Ски-тур', description: 'Горные лыжи и фрирайд', mainCategoryId: 17, createdByUserId: 2, isApproved: true },
      { name: 'Хайкинг', description: 'Треккинг по горным тропам', mainCategoryId: 17, createdByUserId: 3, isApproved: true },

      // === Океан и дайвинг ===
      { name: 'Дайвинг', description: 'Подводное погружение', mainCategoryId: 18, createdByUserId: 1, isApproved: true },
      { name: 'Серфинг', description: 'Серфинг на волнах океана', mainCategoryId: 18, createdByUserId: 2, isApproved: true },
      { name: 'Кайтинг', description: 'Кайтсерфинг и кайтбординг', mainCategoryId: 18, createdByUserId: 3, isApproved: true },
      { name: 'Водные виды спорта', description: 'Вейкбординг, вейвбинг', mainCategoryId: 18, createdByUserId: 1, isApproved: true },

      // === Кулинария ===
      { name: 'Итальянская кухня', description: 'Паста, пицца, ризотто', mainCategoryId: 19, createdByUserId: 2, isApproved: true },
      { name: 'Азиатская кухня', description: 'Суши, вок, рамен', mainCategoryId: 19, createdByUserId: 3, isApproved: true },
      { name: 'Русская кухня', description: 'Традиционные русские блюда', mainCategoryId: 19, createdByUserId: 1, isApproved: true },
      { name: 'Вегетарианство', description: 'Растительное питание', mainCategoryId: 19, createdByUserId: 2, isApproved: true },
      { name: 'Гриль и барбекю', description: 'Мясо на огне, соусы', mainCategoryId: 19, createdByUserId: 3, isApproved: true },
      { name: 'Консервация', description: 'Закатки, маринады', mainCategoryId: 19, createdByUserId: 1, isApproved: true },
      { name: 'Супы', description: 'Техники приготовления супов', mainCategoryId: 19, createdByUserId: 2, isApproved: true },
      { name: 'Салаты', description: 'Витаминам богатые салаты', mainCategoryId: 19, createdByUserId: 3, isApproved: true },
      { name: 'Мясные блюда', description: 'Рецепты из мяса', mainCategoryId: 19, createdByUserId: 1, isApproved: true },
      { name: 'Рыбные блюда', description: 'Рецепты из рыбы и морепродуктов', mainCategoryId: 19, createdByUserId: 2, isApproved: true },

      // === Выпечка и десерты ===
      { name: 'Хлебобулочные изделия', description: 'Домашний хлеб, багеты', mainCategoryId: 20, createdByUserId: 3, isApproved: true },
      { name: 'Торты', description: 'Кремы, декорирование тортов', mainCategoryId: 20, createdByUserId: 1, isApproved: true },
      { name: 'Печенье', description: 'Разнообразное печенье', mainCategoryId: 20, createdByUserId: 2, isApproved: true },
      { name: 'Шоколадные десерты', description: 'Трюфели, муссы, фондан', mainCategoryId: 20, createdByUserId: 3, isApproved: true },
      { name: 'Мороженое', description: 'Домашнее мороженое и сорбеты', mainCategoryId: 20, createdByUserId: 1, isApproved: true },
      { name: 'Кондитерское искусство', description: 'Макарон, пахлава, эклеры', mainCategoryId: 20, createdByUserId: 2, isApproved: true },

      // === Вино и коктейли ===
      { name: 'Виноделие', description: 'Домашнее виноделие', mainCategoryId: 21, createdByUserId: 3, isApproved: true },
      { name: 'Коктейли', description: 'Авторские коктейли', mainCategoryId: 21, createdByUserId: 1, isApproved: true },
      { name: 'Пивоварение', description: 'Домашнее пивоварение', mainCategoryId: 21, createdByUserId: 2, isApproved: true },
      { name: 'Кофе', description: 'Виды кофе, обжарка, рецепты', mainCategoryId: 21, createdByUserId: 3, isApproved: true },

      // === Наука ===
      { name: 'Физика', description: 'Квантовая физика, термодинамика', mainCategoryId: 22, createdByUserId: 1, isApproved: true },
      { name: 'Математика', description: 'Алгебра, геометрия, анализ', mainCategoryId: 22, createdByUserId: 2, isApproved: true },
      { name: 'Биология', description: 'Молекулярная биология, генетика', mainCategoryId: 22, createdByUserId: 3, isApproved: true },
      { name: 'Химия', description: 'Органическая и неорганическая химия', mainCategoryId: 22, createdByUserId: 1, isApproved: true },
      { name: 'Астрономия', description: 'Наблюдение за звёздами', mainCategoryId: 22, createdByUserId: 2, isApproved: true },
      { name: 'Геология', description: 'Строение Земли, минералы', mainCategoryId: 22, createdByUserId: 3, isApproved: true },
      { name: 'Биотехнологии', description: 'ГМО, клонирование, CRISPR', mainCategoryId: 22, createdByUserId: 1, isApproved: true },
      { name: 'Космос', description: 'Исследование космоса', mainCategoryId: 22, createdByUserId: 2, isApproved: true },

      // === История ===
      { name: 'Древний мир', description: 'Античная цивилизации', mainCategoryId: 23, createdByUserId: 3, isApproved: true },
      { name: 'Средневековье', description: 'Рыцари, замки, феодализм', mainCategoryId: 23, createdByUserId: 1, isApproved: true },
      { name: 'Новое время', description: 'Великие открытия, революции', mainCategoryId: 23, createdByUserId: 2, isApproved: true },
      { name: 'XX век', description: 'Мировые войны, холодная война', mainCategoryId: 23, createdByUserId: 3, isApproved: true },
      { name: 'История России', description: 'Русь, империя, СССР', mainCategoryId: 23, createdByUserId: 1, isApproved: true },

      // === Философия ===
      { name: 'Этика', description: 'Учение о морали и нравственности', mainCategoryId: 24, createdByUserId: 2, isApproved: true },
      { name: 'Метафизика', description: 'Природа бытия и реальности', mainCategoryId: 24, createdByUserId: 3, isApproved: true },
      { name: 'Логика', description: 'Правильное мышление и рассуждение', mainCategoryId: 24, createdByUserId: 1, isApproved: true },
      { name: 'Экзистенциализм', description: 'Смысл жизни, свобода выбора', mainCategoryId: 24, createdByUserId: 2, isApproved: true },

      // === Языки ===
      { name: 'Английский', description: 'Изучение английского языка', mainCategoryId: 25, createdByUserId: 3, isApproved: true },
      { name: 'Немецкий', description: 'Изучение немецкого', mainCategoryId: 25, createdByUserId: 1, isApproved: true },
      { name: 'Французский', description: 'Изучение французского', mainCategoryId: 25, createdByUserId: 2, isApproved: true },
      { name: 'Японский', description: 'Изучение японского языка', mainCategoryId: 25, createdByUserId: 3, isApproved: true },
      { name: 'Лингвистика', description: 'Наука о языке', mainCategoryId: 25, createdByUserId: 1, isApproved: true },
      { name: 'Перевод', description: 'Теория и практика перевода', mainCategoryId: 25, createdByUserId: 2, isApproved: true },

      // === Хобби и рукоделие ===
      { name: 'Вышивание', description: 'Крестики, гладь, ленточное', mainCategoryId: 26, createdByUserId: 3, isApproved: true },
      { name: 'Плетение', description: 'Из ниток, бисера, веревок', mainCategoryId: 26, createdByUserId: 1, isApproved: true },
      { name: 'Скрапбукинг', description: 'Альбомы и фотокниги', mainCategoryId: 26, createdByUserId: 2, isApproved: true },
      { name: 'Origami', description: 'Бумажное моделирование', mainCategoryId: 26, createdByUserId: 3, isApproved: true },
      { name: 'Керамика', description: 'Лепка и обжиг глины', mainCategoryId: 26, createdByUserId: 1, isApproved: true },
      { name: 'Шитье', description: 'Конструирование одежды', mainCategoryId: 26, createdByUserId: 2, isApproved: true },

      // === Вязание и шитье ===
      { name: 'Вязание спицами', description: 'Узоры, модели, техники', mainCategoryId: 27, createdByUserId: 3, isApproved: true },
      { name: 'Крючком', description: 'Амигуруми, салфетки', mainCategoryId: 27, createdByUserId: 1, isApproved: true },
      { name: 'Шитье одежды', description: 'Выкройки, обработка', mainCategoryId: 27, createdByUserId: 2, isApproved: true },
      { name: 'Пэчворк', description: 'Лоскутное шитье', mainCategoryId: 27, createdByUserId: 3, isApproved: true },

      // === Деревообработка ===
      { name: 'Деревообработка', description: 'Работа с деревом', mainCategoryId: 28, createdByUserId: 1, isApproved: true },
      { name: 'Резьба по дереву', description: 'Декоративная резьба', mainCategoryId: 28, createdByUserId: 2, isApproved: true },
      { name: 'Дерево обработки', description: 'Техники обработки', mainCategoryId: 28, createdByUserId: 3, isApproved: true },

      // === Рыбалка и охота ===
      { name: 'Рыбалка', description: 'Спиннинг, фидер, поплавочная', mainCategoryId: 29, createdByUserId: 1, isApproved: true },
      { name: 'Охота', description: 'Виды охоты, снаряжение', mainCategoryId: 29, createdByUserId: 2, isApproved: true },

      // === Автомобили ===
      { name: 'Автолюбители', description: 'Сообщество автолюбителей', mainCategoryId: 30, createdByUserId: 3, isApproved: true },
      { name: 'Автоспорт', description: 'Гонки, дрифт, ралли', mainCategoryId: 30, createdByUserId: 1, isApproved: true },
      { name: 'DIY автосервис', description: 'Самостоятельный ремонт авто', mainCategoryId: 30, createdByUserId: 2, isApproved: true },
      { name: 'Электромобили', description: 'Tesla, Nissan Leaf и другие', mainCategoryId: 30, createdByUserId: 3, isApproved: true },
      { name: 'Классические авто', description: 'Винтажные автомобили', mainCategoryId: 30, createdByUserId: 1, isApproved: true },

      // === Велоспорт ===
      { name: 'Горный велосипед', description: 'MTB, даунхилл, кросс-кантри', mainCategoryId: 31, createdByUserId: 2, isApproved: true },
      { name: 'Шоссейный велосипед', description: 'Гонки на шоссе', mainCategoryId: 31, createdByUserId: 3, isApproved: true },
      { name: 'Городской велосипед', description: 'Комьютинг на велике', mainCategoryId: 31, createdByUserId: 1, isApproved: true },

      // === Бизнес и стартапы ===
      { name: 'Стартапы', description: 'Запуск и развитие стартапов', mainCategoryId: 32, createdByUserId: 2, isApproved: true },
      { name: 'E-commerce', description: 'Интернет-торговля', mainCategoryId: 32, createdByUserId: 3, isApproved: true },
      { name: 'Маркетинг', description: 'Digital маркетинг, SMM', mainCategoryId: 32, createdByUserId: 1, isApproved: true },
      { name: 'Предпринимательство', description: 'Малый и средний бизнес', mainCategoryId: 32, createdByUserId: 2, isApproved: true },

      // === Карьера и развитие ===
      { name: 'Soft skills', description: 'Навыки общения, лидерство', mainCategoryId: 33, createdByUserId: 3, isApproved: true },
      { name: 'Нетворкинг', description: 'Профессиональные связи', mainCategoryId: 33, createdByUserId: 1, isApproved: true },
      { name: 'Фриланс', description: 'Удаленная работа, проекты', mainCategoryId: 33, createdByUserId: 2, isApproved: true },

      // === Инвестиции и финансы ===
      { name: 'Инвестиции', description: 'Акции, облигации, фонды', mainCategoryId: 34, createdByUserId: 3, isApproved: true },
      { name: 'Криптовалюта', description: 'Bitcoin, Ethereum, DeFi', mainCategoryId: 34, createdByUserId: 1, isApproved: true },
      { name: 'Личные финансы', description: 'Бюджетирование, накопления', mainCategoryId: 34, createdByUserId: 2, isApproved: true },
      { name: 'Недвижимость', description: 'Инвестиции в недвижимость', mainCategoryId: 34, createdByUserId: 3, isApproved: true },

      // === Образование ===
      { name: 'Онлайн-курсы', description: 'Платформы и курсы', mainCategoryId: 35, createdByUserId: 1, isApproved: true },
      { name: 'Преподавание', description: 'Методики обучения', mainCategoryId: 35, createdByUserId: 2, isApproved: true },
      { name: 'Стипендии', description: 'Программы грантов', mainCategoryId: 35, createdByUserId: 3, isApproved: true },

      // === Самообразование ===
      { name: 'Self-study техники', description: 'Методы самообучения', mainCategoryId: 36, createdByUserId: 1, isApproved: true },
      { name: 'Книжные обзоры', description: 'Рецензии на обучающие книги', mainCategoryId: 36, createdByUserId: 2, isApproved: true },
      { name: 'Podcasts', description: 'Обучающие подкасты', mainCategoryId: 36, createdByUserId: 3, isApproved: true },

      // === Видеоигры ===
      { name: 'RPG игры', description: 'Ролевые игры', mainCategoryId: 37, createdByUserId: 1, isApproved: true },
      { name: 'Шутеры', description: 'FPS, TPS игры', mainCategoryId: 37, createdByUserId: 2, isApproved: true },
      { name: 'Стратегии', description: 'RTS, Grand Strategy', mainCategoryId: 37, createdByUserId: 3, isApproved: true },
      { name: 'Инди игры', description: 'Независимая разработка', mainCategoryId: 37, createdByUserId: 1, isApproved: true },
      { name: 'Moba', description: 'Dota, League of Legends', mainCategoryId: 37, createdByUserId: 2, isApproved: true },
      { name: 'Спорт игры', description: 'Футбол, баскетбол симуляторы', mainCategoryId: 37, createdByUserId: 3, isApproved: true },
      { name: 'Хоррор игры', description: 'Ужасы и триллеры', mainCategoryId: 37, createdByUserId: 1, isApproved: true },
      { name: 'MMO', description: 'Многопользовательские онлайн игры', mainCategoryId: 37, createdByUserId: 2, isApproved: true },

      // === Настольные игры ===
      { name: 'D&D', description: 'Dungeons and Dragons', mainCategoryId: 38, createdByUserId: 3, isApproved: true },
      { name: 'Карточные игры', description: 'MTG, Pokémon, Uno', mainCategoryId: 38, createdByUserId: 1, isApproved: true },
      { name: 'Стратегические настолки', description: 'Каркассон, Эволюция', mainCategoryId: 38, createdByUserId: 2, isApproved: true },
      { name: 'Анархия', description: 'Party games, Mafia', mainCategoryId: 38, createdByUserId: 3, isApproved: true },

      // === Дом и сад ===
      { name: 'Ремонт', description: 'Дизайн и renovation', mainCategoryId: 39, createdByUserId: 1, isApproved: true },
      { name: 'Садоводство', description: 'Огород, цветы, деревья', mainCategoryId: 39, createdByUserId: 2, isApproved: true },
      { name: 'Мебель', description: 'Самостоятельное изготовление', mainCategoryId: 39, createdByUserId: 3, isApproved: true },
      { name: 'Дизайн интерьера', description: 'Стили, цветовые палитры', mainCategoryId: 39, createdByUserId: 1, isApproved: true },

      // === Дизайн интерьера ===
      { name: 'Современный стиль', description: 'Минимализм, скандинавский', mainCategoryId: 40, createdByUserId: 2, isApproved: true },
      { name: 'Классический интерьер', description: 'Традиционный дизайн', mainCategoryId: 40, createdByUserId: 3, isApproved: true },
      { name: 'Декорирование', description: 'Аксессуары, текстиль', mainCategoryId: 40, createdByUserId: 1, isApproved: true },

      // === Мода и стиль ===
      { name: 'Уличный стиль', description: 'Streetwear, casual', mainCategoryId: 41, createdByUserId: 2, isApproved: true },
      { name: 'Винтаж', description: 'Ретро мода, second-hand', mainCategoryId: 41, createdByUserId: 3, isApproved: true },
      { name: 'Sustainable fashion', description: 'Осознанная мода', mainCategoryId: 41, createdByUserId: 1, isApproved: true },
      { name: 'Fashion блоги', description: 'Создание модного контента', mainCategoryId: 41, createdByUserId: 2, isApproved: true },

      // === Красота и уход ===
      { name: 'Уход за кожей', description: 'Скайн-ROUTИН, косметика', mainCategoryId: 42, createdByUserId: 3, isApproved: true },
      { name: 'Макияж', description: 'Техники мейкапа', mainCategoryId: 42, createdByUserId: 1, isApproved: true },
      { name: 'Парикмахерское искусство', description: 'Стрижки, окрашивание', mainCategoryId: 42, createdByUserId: 2, isApproved: true },

      // === Психология ===
      { name: 'Когнитивная психология', description: 'Мышление, память, внимание', mainCategoryId: 43, createdByUserId: 3, isApproved: true },
      { name: 'Психосоматика', description: 'Связь тела и психики', mainCategoryId: 43, createdByUserId: 1, isApproved: true },
      { name: 'Психология отношений', description: 'Парная, семейная психология', mainCategoryId: 43, createdByUserId: 2, isApproved: true },
      { name: 'Детская психология', description: 'Развитие детей, подростковый возраст', mainCategoryId: 43, createdByUserId: 3, isApproved: true },

      // === Самопознание ===
      { name: 'Дневник', description: 'Ведение дневника', mainCategoryId: 44, createdByUserId: 1, isApproved: true },
      { name: 'Цели и мечты', description: 'Постановка целей, визуализация', mainCategoryId: 44, createdByUserId: 2, isApproved: true },
      { name: 'Осознанность', description: 'Mindfulness, внимательность', mainCategoryId: 44, createdByUserId: 3, isApproved: true },
    ],
  });

  // Создание постов
  await prisma.post.createMany({
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
        subcategoryId: 35,
        authorId: 2
      },
      {
        title: 'История джаза',
        content: 'Джаз — это музыкальный жанр, который зародился в начале 20 века в Новом Орлеане. Узнайте больше о его развитии и знаменитых исполнителях.',
        tags: ['music', 'history'],
        subcategoryId: 31,
        authorId: 3
      },
      {
        title: 'Что посмотреть в Париже',
        content: 'Париж — город света искусств и культуры. Обязательно посетите Эйфелеву башню, Лувр и Мулен Руж.',
        tags: ['travel', 'guide'],
        subcategoryId: 39,
        authorId: 1
      },
      {
        title: 'Рецепт идеального борща',
        content: 'Борщ — это традиционное блюдо славянских народов. Секрет идеального борща — в правильном соотношении ингредиентов и длительном тушении.',
        tags: ['recipe', 'food'],
        subcategoryId: 58,
        authorId: 2
      },
      {
        title: 'Основы квантовой механики',
        content: 'Квантовая механика — это раздел физики, изучающий поведение материи и энергии на атомном и субатомном уровнях.',
        tags: ['science', 'physics'],
        subcategoryId: 73,
        authorId: 3
      },
      {
        title: 'Машинное обучение для начинающих',
        content: 'Machine Learning — это раздел искусственного интеллекта, позволяющий компьютерам учиться на данных без явного программирования.',
        tags: ['AI', 'ML'],
        subcategoryId: 18,
        authorId: 1
      },
      {
        title: 'Топ-10 мест для путешествия по Азии',
        content: 'Азия — самый разнообразный континент для путешествий. Вот мои топ-10 обязательных мест: Бали, Токио, Бангкок, Пхукет, Чангмай...',
        tags: ['travel', 'asia'],
        subcategoryId: 43,
        authorId: 2
      },
      {
        title: 'Домашнее пивоварение: пошаговый гайд',
        content: 'Домашнее пивоварение — это увлекательное хобби. Вам понадобятся: солод, хмель, дрожжи, оборудование и 4-6 недель времени.',
        tags: ['beer', 'diy'],
        subcategoryId: 66,
        authorId: 3
      },
      {
        title: 'Инвестиции в акции для начинающих',
        content: 'Инвестирование в акции — это способ приумножить капитал. Начните с индексных фондов и диверсифицируйте портфель.',
        tags: ['invest', 'stocks'],
        subcategoryId: 83,
        authorId: 1
      },
      {
        title: 'Создание мобильного приложения на Flutter',
        content: 'Flutter — это фреймворк от Google для кроссплатформенной разработки. Один код для iOS и Android.',
        tags: ['flutter', 'mobile'],
        subcategoryId: 15,
        authorId: 2
      },
      {
        title: 'Йога утром: 10 поз для начинающих',
        content: 'Утренняя йога помогает зарядиться энергией на весь день. Начните с простых поз: кошка-корова, собака мордой вниз, воин.',
        tags: ['yoga', 'morning'],
        subcategoryId: 38,
        authorId: 3
      },
    ],
  });

  // Создание подписок
  await prisma.follow.createMany({
    data: [
      { followerId: 2, followingId: 1 },
      { followerId: 3, followingId: 1 },
      { followerId: 4, followingId: 1 },
      { followerId: 5, followingId: 1 },
      { followerId: 3, followingId: 2 },
      { followerId: 4, followingId: 2 },
      { followerId: 5, followingId: 3 },
    ],
  });

  // Создание лайков постов
  await prisma.postLike.createMany({
    data: [
      { userId: 2, postId: 1 },
      { userId: 3, postId: 1 },
      { userId: 4, postId: 1 },
      { userId: 5, postId: 1 },
      { userId: 1, postId: 2 },
      { userId: 3, postId: 2 },
      { userId: 2, postId: 3 },
      { userId: 4, postId: 4 },
      { userId: 5, postId: 5 },
      { userId: 1, postId: 6 },
      { userId: 2, postId: 7 },
      { userId: 3, postId: 8 },
      { userId: 4, postId: 9 },
      { userId: 5, postId: 10 },
      { userId: 1, postId: 11 },
      { userId: 2, postId: 12 },
    ],
  });

  // Добавление в избранное подкатегории
  await prisma.userFavoriteSubcategory.createMany({
    data: [
      { userId: 2, subcategoryId: 1 },
      { userId: 2, subcategoryId: 18 },
      { userId: 3, subcategoryId: 5 },
      { userId: 3, subcategoryId: 39 },
      { userId: 4, subcategoryId: 35 },
      { userId: 4, subcategoryId: 73 },
      { userId: 5, subcategoryId: 83 },
      { userId: 5, subcategoryId: 6 },
    ],
  });

  // Добавление закладок
  await prisma.bookmark.createMany({
    data: [
      { userId: 2, postId: 1 },
      { userId: 3, postId: 4 },
      { userId: 4, postId: 5 },
      { userId: 5, postId: 10 },
    ],
  });

  console.log('Тестовые данные созданы успешно!');
  console.log(`Пользователей: 5`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });