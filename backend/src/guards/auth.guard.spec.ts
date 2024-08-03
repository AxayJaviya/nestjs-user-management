import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
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
        getRequest: () => ({ headers: { authorization: 'Bearer token' } }),
      }),
    } as unknown as ExecutionContext;

    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockRejectedValueOnce(new Error('Invalid token'));

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should attach user to request if token is valid', async () => {
    const mockUser = { userId: 1 };
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValueOnce(mockUser as any);

    const mockRequest = {
      headers: { authorization: 'Bearer token' },
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
    const request = { headers: { authorization: 'Bearer token' } } as Request;
    const token = (guard as any).extractTokenFromHeader(request);
    expect(token).toBe('token');
  });

  it('should return undefined if header does not contain Bearer token', () => {
    const request = { headers: { authorization: 'Basic token' } } as Request;
    const token = (guard as any).extractTokenFromHeader(request);
    expect(token).toBeUndefined();
  });
});
