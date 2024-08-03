import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { InMemoryTokensRepository } from '../modules/auth/repositories/in-memory.tokens.repository';
import { TokensService } from '../modules/auth/services/tokens.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let tokensService: TokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        TokensService,
        { provide: 'TokensRepository', useClass: InMemoryTokensRepository },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
            decode: jest.fn().mockReturnValue({ id: 1, username: 'testuser' }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-jwt-secret'),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    tokensService = module.get<TokensService>(TokensService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token verification fails', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer invalidAccessToken' },
        }),
      }),
    } as unknown as ExecutionContext;

    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockRejectedValueOnce(new Error('Invalid accessToken!'));

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is blacklisted', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer expiredAccessToken' },
        }),
      }),
    } as unknown as ExecutionContext;

    await tokensService.invalidateToken('expiredAccessToken');

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should attach user to request if token is valid', async () => {
    const mockUser = { userId: 1, username: 'testuser' };

    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValueOnce(mockUser as any);

    const mockRequest = {
      headers: { authorization: 'Bearer accessToken' },
    } as unknown as Request;

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest['user']).toEqual(mockUser);
  });

  it('should extract token from header correctly', () => {
    const request = {
      headers: { authorization: 'Bearer accessToken' },
    } as Request;
    const token = (guard as any).extractTokenFromHeader(request);

    expect(token).toBe('accessToken');
  });

  it('should return undefined if header does not contain Bearer token', () => {
    const request = {
      headers: { authorization: 'Basic accessToken' },
    } as Request;
    const token = (guard as any).extractTokenFromHeader(request);

    expect(token).toBeUndefined();
  });
});
