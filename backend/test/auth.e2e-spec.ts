import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/modules/auth/services/auth.service';
import { TokensService } from '../src/modules/auth/services/tokens.service';
import { PrismaService } from '../src/modules/prisma/services/prisma.service';
import { MockConfigService } from './mocks/mock.config.service';
import { PrismaServiceMock } from './mocks/mock.prisma.service';

describe('UserController E2E tests for /api/auth routes', () => {
  let app: INestApplication;
  let authService: AuthService;
  let tokensService: TokensService;
  let testToken: string;

  const username = `user-${Date.now()}`;
  const password = 'password123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useClass(PrismaServiceMock)
      .overrideProvider(ConfigService)
      .useClass(MockConfigService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    tokensService = moduleFixture.get<TokensService>(TokensService);

    // Create a test user and get a valid accessToken for authentication
    const signupResponse = await authService.signUp({ username, password });
    testToken = signupResponse.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/signup (POST)', async () => {
    const newUsername = 'newuser_' + Date.now();
    const signUpDto = { username: newUsername, password };

    return request(app.getHttpServer())
      .post('/auth/signup')
      .send(signUpDto)
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual({
          accessToken: expect.any(String),
        });

        // Verify the new user is created in the database
        return authService
          .signIn({ username: newUsername, password })
          .then((tokens) => {
            expect(tokens).toEqual({
              accessToken: expect.any(String),
            });
          });
      });
  });

  it('/auth/signin (POST)', async () => {
    const signInDto = { username, password };

    return request(app.getHttpServer())
      .post('/auth/signin')
      .send(signInDto)
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual({
          accessToken: expect.any(String),
        });
      });
  });

  it('/auth/signin (POST) - invalid password', async () => {
    const signInDto = { username, password: 'wrong-password' };

    return request(app.getHttpServer())
      .post('/auth/signin')
      .send(signInDto)
      .expect(401)
      .then((response) => {
        expect(response.body.message).toBe('Incorrect username or password!');
      });
  });

  it('/auth/logout (GET)', async () => {
    return request(app.getHttpServer())
      .get('/auth/logout')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200)
      .then(async () => {
        // Verify the token is blacklisted
        const isBlacklisted = await tokensService.isBlacklisted(testToken);
        expect(isBlacklisted).toBe(true);
      });
  });
});
