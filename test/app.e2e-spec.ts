import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

type AuthResponse = {
  token: string;
  user: { id: number; email: string; username: string };
};

async function registerAndLogin(app: INestApplication<App>, seed: string) {
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
  let app: INestApplication<App>;
  let prisma: PrismaService;

   beforeAll(async () => {
     const moduleFixture: TestingModule = await Test.createTestingModule({
       imports: [AppModule],
     })
       .overrideProvider(PrismaService)
       .useValue({
         $transaction: async <T>(operations: T[]): Promise<T> => {
           return (operations as any[])[0] as any;
         },
         findUnique: async <T>(where: { email: string }) => {
           return {
             id: 1,
             email: where.email,
             username: where.email.split('@')[0],
             role: 'USER' as const,
           };
         },
         create: async <T>(data: any) => {
           return { id: 1, ...data };
         },
         post: {
           findFirst: async () => null,
         },
       })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
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
    const post = await prisma.post.findFirst({ select: { id: true } });
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

  it('notifications: list + read-all', async () => {
    const u = await registerAndLogin(app, 'notifs');

    await request(app.getHttpServer())
      .get('/api/notifications')
      .set('Authorization', `Bearer ${u.token}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch('/api/notifications/read-all')
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