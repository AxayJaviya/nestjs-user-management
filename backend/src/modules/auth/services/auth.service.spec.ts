import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { InMemoryUsersRepository } from '../../users/repositories/in-memory.users.repository';
import { UsersService } from '../../users/services/users.service';
import { SignInDto } from '../dtos/sign-in.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { InMemoryTokensRepository } from '../repositories/in-memory.tokens.repository';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';

// Mocks
jest.mock('bcrypt');

// Mock JwtService
const mockJwtService = {
  sign: jest.fn(
    ({ id, username }: { id: number; username: string }) => `${id}:${username}`,
  ),
  decode: jest.fn(() => ({ id: 1, username: 'testuser' })),
};

// Mock ConfigService
const mockConfigService = {
  get: jest.fn((key: 'JWT_TOKEN_SECRET') => key.toLowerCase()),
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Variables
  const username = 'testuser';
  const password = 'password123';

  const setupBcryptMocks = () => {
    (bcrypt.hash as jest.Mock).mockImplementation(
      async (password: string) => `hashed${password}`,
    );
    (bcrypt.compare as jest.Mock).mockImplementation(
      async (plainPassword: string, hashedPassword: string) =>
        hashedPassword === `hashed${plainPassword}`,
    );
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
  };

  const userSignUp = async () => {
    const signUpDto: SignUpDto = { username, password };
    return authService.signUp(signUpDto);
  };

  const validateUser = async () => {
    const user = await usersService.getFullUserByUserName(username);
    expect(user).toEqual(
      expect.objectContaining({
        username,
        password: `hashed${password}`,
        created_at: expect.anything(),
        updated_at: expect.anything(),
      }),
    );
  };

  beforeEach(async () => {
    setupBcryptMocks();

    const module: TestingModule = await Test.createTestingModule({
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

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear users in the repository before each test
    (usersService as unknown as InMemoryUsersRepository).clearUsers();
  });

  describe('signUp', () => {
    it('should hash password, create user, and return an accessToken', async () => {
      const responseToken = await userSignUp();

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 'salt');
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: expect.any(Number),
        username,
      });
      expect(responseToken).toEqual({ accessToken: expect.any(String) });

      await validateUser();
    });
  });

  describe('signIn', () => {
    it('should return an accessToken if username and password are correct', async () => {
      const accessToken = `1:${username}`;

      await userSignUp();
      const signInDto: SignInDto = { username, password };
      const result = await authService.signIn(signInDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        password,
        `hashed${password}`,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: expect.any(Number),
        username,
      });
      expect(result).toEqual({ accessToken });

      await validateUser();
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      await userSignUp();

      const signInDto: SignInDto = { username, password: 'wrongPassword' };
      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw NotFoundException if username is not found', async () => {
      const signInDto: SignInDto = {
        username: 'invalidUserName',
        password: 'password123',
      };
      await expect(authService.signIn(signInDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('logout', () => {
    it('should invalidate accessToken for given user', async () => {
      const responseToken = await userSignUp();

      await expect(
        authService.logout(responseToken.accessToken),
      ).resolves.toBeUndefined();
    });
  });
});
