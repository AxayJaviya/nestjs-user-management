import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { InMemoryUsersRepository } from '../../users/repositories/in-memory.users.repository';
import { UsersService } from '../../users/services/users.service';
import { SignInDto } from '../dtos/sign-in.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { AuthService } from './auth.service';

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

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // variables
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
    expect(user).toEqual({
      id: 1,
      username,
      password: `hashed${password}`,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    });
  };

  beforeEach(async () => {
    setupBcryptMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        { provide: 'UsersRepository', useClass: InMemoryUsersRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signUp', () => {
    it('should hash password, create user, and return a token', async () => {
      const token = `1:${username}`;

      const responseToken = await userSignUp();

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 'salt');
      expect(jwtService.sign).toHaveBeenCalledWith({ id: 1, username });
      expect(responseToken).toEqual({ token });

      await validateUser();
    });
  });

  describe('signIn', () => {
    it('should return a token if username and password are correct', async () => {
      const token = `1:${username}`;

      await userSignUp();
      const signInDto: SignInDto = { username, password };
      const result = await authService.signIn(signInDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        password,
        `hashed${password}`,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({ id: 1, username });
      expect(result).toEqual({ token });

      await validateUser();
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      await userSignUp();

      const signInDto: SignInDto = { username, password: 'wrongPassword' };
      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if username is not found', async () => {
      const signInDto: SignInDto = {
        username: 'invalidUserName',
        password: 'password123',
      };
      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
