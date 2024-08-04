import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/guards/auth.guard';
import { PrismaService } from '../src/modules/prisma/services/prisma.service';
import { UsersService } from '../src/modules/users/services/users.service';
import { PrismaServiceMock } from './mocks/mock.prisma.service';

describe('UserController E2E tests for /api/users routes', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let jwtService: JwtService;
  let authToken: string;

  const username = `user-${Date.now()}`;
  const password = 'password123';
  const updatedUserName = `updated-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useClass(PrismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: async (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 1 }; // Mock user
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create a test user
    const createdUser = await usersService.createUser({
      username,
      password,
    });

    // Generate a test token
    authToken = await jwtService.signAsync(
      { id: createdUser.id, username },
      {
        secret: 'test-secret',
      },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users/profile (PATCH)', async () => {
    return request(app.getHttpServer())
      .patch('/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ username: updatedUserName })
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          id: expect.any(Number),
          username: updatedUserName,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        });
      });
  });

  it('/users/whoami (GET)', async () => {
    return request(app.getHttpServer())
      .get('/users/whoami')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          id: expect.any(Number),
          username: updatedUserName,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        });
      });
  });
});
