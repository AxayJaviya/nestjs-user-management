import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { InMemoryTokensRepository } from '../repositories/in-memory.tokens.repository';
import { TokensService } from './tokens.service';

// Mock JwtService
const mockJwtService = {
  decode: jest.fn().mockImplementation((token: string) => {
    if (token === 'validToken') {
      return { id: 1, username: 'testuser' }; // Simulate a valid decoded token
    }
    return null;
  }),
};

describe('TokenService', () => {
  let tokenService: TokensService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        { provide: 'TokensRepository', useClass: InMemoryTokensRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    tokenService = module.get<TokensService>(TokensService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('invalidateToken', () => {
    it('should invalidate a valid token', async () => {
      const token = 'validToken';
      await tokenService.invalidateToken(token);

      expect(jwtService.decode).toHaveBeenCalledWith(token);
      expect(await tokenService.isBlacklisted(token)).toBe(true);
    });

    it('should throw UnauthorizedException for an invalid token', async () => {
      const token = 'invalidToken';

      await expect(tokenService.invalidateToken(token)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.decode).toHaveBeenCalledWith(token);
      expect(await tokenService.isBlacklisted(token)).toBe(false);
    });
  });

  describe('isBlacklisted', () => {
    it('should return true if the token is blacklisted', async () => {
      const token = 'validToken';
      await tokenService.invalidateToken(token);

      expect(await tokenService.isBlacklisted(token)).toBe(true);
    });

    it('should return false if the token is not blacklisted', async () => {
      const token = 'nonBlacklistedToken';
      expect(await tokenService.isBlacklisted(token)).toBe(false);
    });
  });
});
