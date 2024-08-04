import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/services/prisma.service';
import { PrismaUsersRepository } from './prisma.users.repository';

// Mock data
const mockUser = {
  id: 1,
  username: 'test-user',
  password: 'password123',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockUserWithoutPassword = {
  id: 1,
  username: 'test-user',
  created_at: new Date(),
  updated_at: new Date(),
};

// Mock Prisma service
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('PrismaUsersRepository', () => {
  let repository: PrismaUsersRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUsersRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaUsersRepository>(PrismaUsersRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user and return created user without password', async () => {
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.createUser({
        username: 'test-user',
        password: 'password123',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'test-user' },
      });

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: 'test-user',
          password: 'password123',
        },
      });

      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('should throw BadRequestException if username already exists', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        repository.createUser({
          username: 'test-user',
          password: 'password123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getFullUserByUserName', () => {
    it('should return a user by username', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.getFullUserByUserName('test-user');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'test-user' },
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        repository.getFullUserByUserName('non-existent-user'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserById', () => {
    it('should return a user by id without password', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.getUserById(1);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(repository.getUserById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserById', () => {
    it('should update a user and return the updated user without password', async () => {
      (prismaService.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);

      (prismaService.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        username: 'updated-user',
      });

      const result = await repository.updateUserById(1, {
        username: 'updated-user',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'updated-user' },
      });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { username: 'updated-user' },
      });

      expect(result).toEqual({
        id: 1,
        username: 'updated-user',
        created_at: mockUser.created_at,
        updated_at: expect.any(Date),
      });
    });

    it('should throw NotFoundException if user to update does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        repository.updateUserById(999, { username: 'new-user' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if username already taken', async () => {
      (prismaService.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ id: 2, username: 'taken-user' });

      await expect(
        repository.updateUserById(1, { username: 'taken-user' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
