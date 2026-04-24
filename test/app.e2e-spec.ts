import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// Mock bcrypt globally
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation(async (data: string, salt: number | string) => {
    return '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234';
  }),
  compare: jest.fn().mockImplementation(async (data: string, hash: string) => {
    return true;
  }),
}));

// Mock Prisma models with full database simulation
function createMockPrisma() {
  const users: any[] = [];
  const posts: any[] = [];
  const comments: any[] = [];
  const mainCategories: any[] = [];
  const subcategories: any[] = [];
  const bookmarks: any[] = [];
  const follows: any[] = [];
  const postLikes: any[] = [];
  const commentLikes: any[] = [];
  let userId = 1;
  let postId = 1;
  let commentId = 1;
  let mainCategoryId = 1;
  let subcategoryId = 1;

  const user = {
    findUnique: async (where: any) => {
      if (where.id) return users.find(u => u.id === where.id) || null;
      if (where.email) return users.find(u => u.email === where.email) || null;
      if (where.OR) {
        const conditions = where.OR;
        return users.find(u =>
          conditions.every(c =>
            (c.email && u.email === c.email) || (c.username && u.username === c.username)
          )
        ) || null;
      }
      return null;
    },
    findFirst: async (where: any) => {
      if (where.OR) {
        const conditions = where.OR;
        return users.find(u =>
          conditions.every(c =>
            (c.email && u.email === c.email) || (c.username && u.username === c.username)
          )
        ) || null;
      }
      if (where.id) return users.find(u => u.id === where.id) || null;
      if (where.email) return users.find(u => u.email === where.email) || null;
      return null;
    },
    findMany: async (options?: any) => {
      let result = [...users];
      if (options?.where) {
        const where = options.where;
        if (where.id) result = result.filter(u => u.id === where.id);
        if (where.email) result = result.filter(u => u.email === where.email);
        if (where.username) result = result.filter(u => u.username === where.username);
        if (where.OR) {
          result = result.filter(u =>
            where.OR.every(c =>
              (c.email && u.email === c.email) || (c.username && u.username === c.username)
            )
          );
        }
      }
      if (options?.skip !== undefined) result = result.slice(options.skip);
      if (options?.take !== undefined) result = result.slice(0, options.take);
      return result;
    },
    create: async (data: any) => {
      const user = {
        ...data.data,
        id: userId++,
        role: data.data.role || 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        bio: data.data.bio || null,
        _count: { posts: 0, followers: 0, following: 0 },
        favoriteSubcategories: [],
      };
      users.push(user);
      return user;
    },
    update: async (options: any) => {
      const idx = users.findIndex(u => u.id === options.where.id);
      if (idx === -1) throw new Error('User not found');
      users[idx] = { ...users[idx], ...options.data, updatedAt: new Date() };
      return users[idx];
    },
    count: async (where?: any) => {
      let result = [...users];
      if (where) {
        const w = where.where || where;
        if (w.id) result = result.filter(u => u.id === w.id);
        if (w.email) result = result.filter(u => u.email === w.email);
      }
      return result.length;
    },
    delete: async (where: any) => {
      const idx = users.findIndex(u => u.id === where.id || where.id === where);
      if (idx === -1) throw new Error('User not found');
      return users.splice(idx, 1)[0];
    },
  };

  const post = {
    findFirst: async (options?: any) => {
      if (posts.length === 0) return null;
      return posts[0];
    },
    findMany: async (options?: any) => {
      let result = [...posts];
      if (options?.where) {
        const where = options.where;
        if (where.id) result = result.filter(p => p.id === where.id);
        if (where.subcategoryId) result = result.filter(p => p.subcategoryId === where.subcategoryId);
        if (where.authorId) result = result.filter(p => p.authorId === where.authorId);
        if (where.tags?.has) result = result.filter(p => p.tags.includes(where.tags.has));
        if (where.OR) {
          result = result.filter(p =>
            where.OR.some(c =>
              (c.title && p.title?.includes(c.title)) || (c.content && p.content?.includes(c.content))
            )
          );
        }
      }
      if (options?.skip !== undefined) result = result.slice(options.skip);
      if (options?.take !== undefined) result = result.slice(0, options.take);
      return result;
    },
    findUnique: async (where: any) => {
      return posts.find(p => p.id === where.id) || null;
    },
    create: async (data: any) => {
      const post = {
        ...data.data,
        id: postId++,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      posts.push(post);
      return { ...post, author: data.include?.author ? { id: data.data.authorId, username: data.data.username || 'user' } : null };
    },
    update: async (options: any) => {
      const idx = posts.findIndex(p => p.id === options.where.id);
      if (idx === -1) throw new Error('Post not found');
      if (options.data.likesCount !== undefined) {
        posts[idx].likesCount += options.data.likesCount.increment || options.data.likesCount.decrement || 0;
      }
      if (options.data.commentsCount !== undefined) {
        posts[idx].commentsCount += options.data.commentsCount.increment || options.data.commentsCount.decrement || 0;
      }
      return { ...posts[idx], ...options.data };
    },
  };

  const comment = {
    findMany: async (options?: any) => {
      let result = [...comments];
      if (options?.where) {
        const where = options.where;
        if (where.postId) result = result.filter(c => c.postId === where.postId);
        if (where.parentId !== null) result = result.filter(c => c.parentId === where.parentId);
      }
      return result;
    },
    findUnique: async (where: any) => {
      return comments.find(c => c.id === where.id) || null;
    },
    create: async (data: any) => {
      const comment = {
        ...data.data,
        id: commentId++,
        likesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      comments.push(comment);
      return comment;
    },
    update: async (options: any) => {
      const idx = comments.findIndex(c => c.id === options.where.id);
      if (idx === -1) throw new Error('Comment not found');
      return { ...comments[idx], ...options.data, updatedAt: new Date() };
    },
    delete: async (where: any) => {
      const idx = comments.findIndex(c => c.id === where.id);
      if (idx === -1) throw new Error('Comment not found');
      return comments.splice(idx, 1)[0];
    },
  };

  const mainCategory = {
    findMany: async (options?: any) => {
      if (mainCategories.length === 0) {
        // Seed default categories if empty
        if (options?.include) {
          return [
            {
              id: 1,
              name: 'Спорт',
              subcategories: [],
            },
            {
              id: 2,
              name: 'Культура',
              subcategories: [],
            },
            {
              id: 3,
              name: 'Технологии',
              subcategories: [],
            },
          ];
        }
        return [
          { id: 1, name: 'Спорт' },
          { id: 2, name: 'Культура' },
          { id: 3, name: 'Технологии' },
        ];
      }
      return mainCategories;
    },
    create: async (data: any) => {
      const mc = { ...data.data, id: mainCategoryId++ };
      mainCategories.push(mc);
      return mc;
    },
  };

  const subcategory = {
    findMany: async (options?: any) => {
      let result = [...subcategories];
      if (options?.where) {
        const where = options.where;
        if (where.mainCategoryId) result = result.filter(s => s.mainCategoryId === where.mainCategoryId);
        if (where.isApproved !== undefined) result = result.filter(s => s.isApproved === where.isApproved);
      }
      return result;
    },
    findUnique: async (where: any) => {
      return subcategories.find(s => s.id === where.id) || null;
    },
    create: async (data: any) => {
      const sc = {
        ...data.data,
        id: subcategoryId++,
        isApproved: data.data.isApproved ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      subcategories.push(sc);
      return sc;
    },
    update: async (options: any) => {
      const idx = subcategories.findIndex(s => s.id === options.where.id);
      if (idx === -1) throw new Error('Subcategory not found');
      return { ...subcategories[idx], ...options.data, updatedAt: new Date() };
    },
    delete: async (where: any) => {
      const idx = subcategories.findIndex(s => s.id === where.id);
      if (idx === -1) throw new Error('Subcategory not found');
      return subcategories.splice(idx, 1)[0];
    },
  };

  const bookmark = {
    findMany: async (where: any) => {
      return bookmarks.filter(b => b.userId === where.userId);
    },
    create: async (data: any) => {
      const bm = { ...data.data, createdAt: new Date() };
      bookmarks.push(bm);
      return bm;
    },
    delete: async (where: any) => {
      const idx = bookmarks.findIndex(b => b.userId === where.userId && b.postId === where.postId);
      if (idx === -1) throw new Error('Bookmark not found');
      return bookmarks.splice(idx, 1)[0];
    },
  };

  const follow = {
    create: async (data: any) => {
      const f = { ...data.data };
      follows.push(f);
      return f;
    },
    delete: async (where: any) => {
      const idx = follows.findIndex(f => f.followerId === where.followerId && f.followingId === where.followingId);
      if (idx === -1) throw new Error('Follow not found');
      return follows.splice(idx, 1)[0];
    },
    findMany: async (where: any) => {
      if (where.followerId) return follows.filter(f => f.followerId === where.followerId);
      if (where.followingId) return follows.filter(f => f.followingId === where.followingId);
      return follows;
    },
    findUnique: async (where: any) => {
      return follows.find(f => f.followerId === where.followerId && f.followingId === where.followingId) || null;
    },
  };

  const postLike = {
    findUnique: async (where: any) => {
      return postLikes.find(p => p.userId === where.userId && p.postId === where.postId) || null;
    },
    create: async (data: any) => {
      const pl = { ...data.data };
      postLikes.push(pl);
      return pl;
    },
    delete: async (where: any) => {
      const idx = postLikes.findIndex(p => p.userId === where.userId && p.postId === where.postId);
      if (idx === -1) throw new Error('PostLike not found');
      return postLikes.splice(idx, 1)[0];
    },
  };

  const commentLike = {
    findUnique: async (where: any) => {
      return commentLikes.find(c => c.userId === where.userId && c.commentId === where.commentId) || null;
    },
    create: async (data: any) => {
      const cl = { ...data.data };
      commentLikes.push(cl);
      return cl;
    },
    delete: async (where: any) => {
      const idx = commentLikes.findIndex(c => c.userId === where.userId && c.commentId === where.commentId);
      if (idx === -1) throw new Error('CommentLike not found');
      return commentLikes.splice(idx, 1)[0];
    },
  };

  const userFavoriteSubcategory = {
    create: async (data: any) => {
      const ufs = { ...data.data };
      return ufs;
    },
    findMany: async (where: any) => {
      return bookmarks.filter(b => b.userId === where.userId) || [];
    },
    delete: async (where: any) => {
      return true;
    },
  };

  const $transaction = async (operations: any[]) => {
    return await Promise.all(operations);
  };

  return {
    user,
    post,
    comment,
    mainCategory,
    subcategory,
    bookmark,
    follow,
    postLike,
    commentLike,
    userFavoriteSubcategory,
    $transaction,
    $connect: async () => {},
    $disconnect: async () => {},
    // Helper to get a user by email for assertions
    _getUsers: () => users,
    _getPosts: () => posts,
    _getComments: () => comments,
    _getPostLikes: () => postLikes,
    _getBookmarks: () => bookmarks,
    _clear: () => {
      users.length = 0;
      posts.length = 0;
      comments.length = 0;
      mainCategories.length = 0;
      subcategories.length = 0;
      bookmarks.length = 0;
      follows.length = 0;
      postLikes.length = 0;
      commentLikes.length = 0;
      userId = 1;
      postId = 1;
      commentId = 1;
      mainCategoryId = 1;
      subcategoryId = 1;
    },
  };
}

type AuthResponse = {
  token: string;
  user: { id: number; email: string; username: string };
};

async function registerAndLogin(app: INestApplication, seed: string) {
  const email = `e2e_${seed}_${Date.now()}@test.local`;
  const username = `e2e_${seed}_${Date.now()}`;
  const password = 'Password123!';

  const reg = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({ email, username, password })
    .expect(201);

  const regBody = reg.body as AuthResponse;
  expect(regBody.token).toBeTruthy();

  const login = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  const loginBody = login.body as AuthResponse;
  expect(loginBody.token).toBeTruthy();
  expect(loginBody.user.email).toBe(email);

  return {
    email,
    username,
    password,
    token: loginBody.token,
    userId: loginBody.user.id,
  };
}

describe('Activity Hub API (e2e)', () => {
  let app: INestApplication;
  let mockPrisma: any;
  let realPrismaService: PrismaService;

  beforeAll(async () => {
    mockPrisma = createMockPrisma();

    // Create a real PrismaService that returns our mock
    realPrismaService = new PrismaService();

    // Override $prisma getter to return our mock for all model access
    Object.defineProperty(realPrismaService, 'user', { value: mockPrisma.user, configurable: true, writable: true });
    Object.defineProperty(realPrismaService, 'post', { value: mockPrisma.post, configurable: true, writable: true });
    Object.defineProperty(realPrismaService, 'comment', { value: mockPrisma.comment, configurable: true, writable: true });
    Object.defineProperty(realPrismaService, 'mainCategory', { value: mockPrisma.mainCategory, configurable: true, writable: true });
    Object.defineProperty(realPrismaService, 'subcategory', { value: mockPrisma.subcategory, configurable: true, writable: true });
    Object.defineProperty(realPrismaService, 'bookmark', { value: mockPrisma.bookmark, configurable: true, writable: true });
    Object.defineProperty(realPrismaService, 'follow', { value: mockPrisma.follow, configurable: true, writable: true });
    Object.defineProperty(realPrismaService, 'postLike', { value: mockPrisma.postLike, configurable: true, writable: true });
    Object.defineProperty(realPrismaService, 'commentLike', { value: mockPrisma.commentLike, configurable: true, writable: true });
    Object.defineProperty(realPrismaService, 'userFavoriteSubcategory', { value: mockPrisma.userFavoriteSubcategory, configurable: true, writable: true });
    Object.defineProperty(realPrismaService, '$transaction', { value: mockPrisma.$transaction, configurable: true, writable: true });

  // Mock bcrypt at the module level
  const mockBcrypt = {
    hash: async (data: string, salt: number | string) => {
      return '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234';
    },
    compare: async (data: string, hash: string) => {
      return true;
    },
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(realPrismaService)
      .overrideProvider(JwtService)
      .useValue({
        sign: jest.fn().mockImplementation((payload: any) => {
          return 'mocked_jwt_token_' + payload.sub;
        }),
        verify: jest.fn().mockImplementation((token: string) => {
          return { sub: 1, email: 'test@test.local', role: 'USER' };
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockPrisma._clear();
  });

  it('auth: register/login/logout', async () => {
    const u = await registerAndLogin(app, 'auth');

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${u.token}`)
      .expect(200);
  });

  it('users: me + updateMe', async () => {
    const u = await registerAndLogin(app, 'users');

    const me = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${u.token}`)
      .expect(200);
    expect(me.body.email).toBe(u.email);

    const updated = await request(app.getHttpServer())
      .put('/api/users/me')
      .set('Authorization', `Bearer ${u.token}`)
      .send({ bio: 'e2e bio' })
      .expect(200);
    expect(updated.body.bio).toBe('e2e bio');
  });

  it('categories: tree + propose subcategory + approve forbidden for обычного юзера', async () => {
    const tree = await request(app.getHttpServer())
      .get('/api/categories/tree')
      .expect(200);
    expect(Array.isArray(tree.body)).toBe(true);
    expect(tree.body.length).toBeGreaterThan(0);

    const mainCategoryId: number | undefined = tree.body?.[0]?.id;
    expect(typeof mainCategoryId).toBe('number');

    const u = await registerAndLogin(app, 'subcats');

    const created = await request(app.getHttpServer())
      .post('/api/subcategories')
      .set('Authorization', `Bearer ${u.token}`)
      .send({
        name: `e2e-sub-${Date.now()}`,
        description: 'desc',
        mainCategoryId,
      })
      .expect(201);
    expect(created.body.isApproved).toBe(false);

    await request(app.getHttpServer())
      .patch(`/api/subcategories/${created.body.id}/approve`)
      .set('Authorization', `Bearer ${u.token}`)
      .expect(403);
  });

  it('posts: list + create + like + bookmark', async () => {
    const u = await registerAndLogin(app, 'posts');

    const list = await request(app.getHttpServer())
      .get('/api/posts')
      .expect(200);
    expect(Array.isArray(list.body)).toBe(true);

    const created = await request(app.getHttpServer())
      .post('/api/posts')
      .set('Authorization', `Bearer ${u.token}`)
      .field('title', 'e2e post')
      .field('content', 'e2e content')
      .field('subcategoryId', String(1))
      .field('tags', JSON.stringify(['e2e']))
      .expect(201);
    expect(created.body.id).toBeTruthy();

    await request(app.getHttpServer())
      .post(`/api/users/me/bookmarks/${created.body.id}`)
      .set('Authorization', `Bearer ${u.token}`)
      .expect(201);
  });

  it('comments: create/list/like/update/delete', async () => {
    const u = await registerAndLogin(app, 'comments');
    const post = await realPrismaService.post.findFirst({ select: { id: true } });
    expect(post?.id).toBeTruthy();

    const created = await request(app.getHttpServer())
      .post('/api/comments')
      .set('Authorization', `Bearer ${u.token}`)
      .send({ content: 'e2e comment', postId: post!.id })
      .expect(201);

    const list = await request(app.getHttpServer())
      .get(`/api/posts/${post!.id}/comments`)
      .expect(200);
    expect(Array.isArray(list.body)).toBe(true);

    await request(app.getHttpServer())
      .post(`/api/comments/${created.body.id}/like`)
      .set('Authorization', `Bearer ${u.token}`)
      .expect(200);

    await request(app.getHttpServer())
      .put(`/api/comments/${created.body.id}`)
      .set('Authorization', `Bearer ${u.token}`)
      .send({ content: 'e2e comment updated' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/comments/${created.body.id}`)
      .set('Authorization', `Bearer ${u.token}`)
      .expect(200);
  });

  it('search: global search', async () => {
    await request(app.getHttpServer()).get('/api/search?q=test').expect(200);
  });

  it('graphql: posts + me + bff getHomePage', async () => {
    const u = await registerAndLogin(app, 'gql');

    const postsRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query:
          'query { posts(limit: 3) { id title createdAt author { id username } } }',
      })
      .expect(200);
    expect(postsRes.body.data.posts.length).toBeGreaterThanOrEqual(0);

    const meRes = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${u.token}`)
      .send({ query: 'query { me { id email username role } }' })
      .expect(200);
    expect(meRes.body.data.me.email).toBe(u.email);

    const homeRes = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${u.token}`)
      .send({
        query:
          'query { getHomePage { trendingPosts { id title } categories { id name } me { id } } }',
      })
      .expect(200);
    expect(homeRes.body.data.getHomePage).toBeTruthy();
  });
});