import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { InMemoryUsersRepository } from '../../users/repositories/in-memory.users.repository';
import { UsersService } from '../../users/services/users.service';
import { SignInDto } from '../dtos/sign-in.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { InMemoryTokensRepository } from '../repositories/in-memory.tokens.repository';
import { AuthService } from '../services/auth.service';
import { TokensService } from '../services/tokens.service';
import { AuthController } from './auth.controller';

// Mocks
jest.mock('bcrypt');

// Mock JwtService
const mockJwtService = {
  sign: jest.fn(
    ({ id, username }: { id: number; username: string }) => `${id}:${username}`,
  ),
};

// Mock ConfigService
const mockConfigService = {
  get: jest.fn((key: 'JWT_TOKEN_SECRET') => key.toLowerCase()),
};

describe('AuthController', () => {
  let authController: AuthController;
  let usersService: UsersService;

  // variables
  const username = 'testuser';
  const password = 'password123';

  const setupBcryptMocks = () => {
    (bcrypt.hash as jest.Mock).mockImplementation(
      async (password: string) => `hashed${password}`,
    );
    (bcrypt.compare as jest.Mock).mockImplementation(
      async (plainPassword: string, hashedPassword: string) =>
        plainPassword === hashedPassword.replace('hashed', ''),
    );
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    setupBcryptMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        TokensService,
        { provide: 'TokensRepository', useClass: InMemoryTokensRepository },
        UsersService,
        { provide: 'UsersRepository', useClass: InMemoryUsersRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('signUp', () => {
    it('should return a token on successful sign-up', async () => {
      const signUpDto: SignUpDto = { username, password };
      const accessToken = `1:${username}`;

      const result = await authController.signUp(signUpDto);
      expect(result).toEqual({ accessToken });

      const registeredUser = await usersService.getFullUserByUserName(username);
      expect(registeredUser).toEqual(
        expect.objectContaining({
          id: 1,
          username: signUpDto.username,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          password: `hashed${password}`,
        }),
      );
    });
  });

  describe('signIn', () => {
    it('should return a token on successful sign-in', async () => {
      const signUpDto: SignUpDto = { username, password };
      const signInDto: SignInDto = { ...signUpDto };
      const accessToken = `1:${username}`;

      await authController.signUp(signUpDto);

      const result = await authController.signIn(signInDto);
      expect(result).toEqual({ accessToken });
    });

    it('should throw UnauthorizedException on failed sign-in', async () => {
      const signUpDto: SignUpDto = { username, password };
      const signInDto: SignInDto = { username, password: 'invalidPassword' };

      await authController.signUp(signUpDto);

      await expect(authController.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
