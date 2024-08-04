import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/services/prisma.service';
import { PrismaTokensRepository } from './prisma.tokens.repository';

// Mock data
const token = 'test-accessToken';
const mockBlacklistedToken = {
  id: 1,
  token,
  expired_at: new Date(),
};

// Mock Prisma service
const mockPrismaService = {
  blacklistedToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('PrismaTokensRepository', () => {
  let repository: PrismaTokensRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaTokensRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaTokensRepository>(PrismaTokensRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('invalidateToken', () => {
    it('should add an accessToken to the blacklist', async () => {
      await repository.invalidateToken(token);
      expect(prismaService.blacklistedToken.create).toHaveBeenCalledWith({
        data: { token },
      });
    });
  });

  describe('isBlacklisted', () => {
    it('should return true for a blacklisted accessToken', async () => {
      (
        prismaService.blacklistedToken.findUnique as jest.Mock
      ).mockResolvedValueOnce(mockBlacklistedToken);
      expect(await repository.isBlacklisted(token)).toBe(true);
    });

    it('should return false for a non-blacklisted accessToken', async () => {
      (
        prismaService.blacklistedToken.findUnique as jest.Mock
      ).mockResolvedValueOnce(null);
      expect(await repository.isBlacklisted('non-existent-token')).toBe(false);
    });
  });
});
