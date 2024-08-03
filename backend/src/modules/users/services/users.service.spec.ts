import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { InMemoryUsersRepository } from '../repositories/in-memory.users.repository';
import { UsersService } from './users.service';

// Mock bcrypt methods
jest.mock('bcrypt', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password: string, hash: string) =>
    Promise.resolve(hash === `hashed_${password}`),
  ),
  genSalt: jest.fn(() => Promise.resolve('salt')),
}));

describe('UsersService', () => {
  let service: UsersService;

  // Helper function to create a user
  const createUser = async (
    username = 'testUser',
    password = 'password123',
  ) => {
    return service.createUser({
      username,
      password,
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'UsersRepository', useClass: InMemoryUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // Clear users in the repository before each test
    await service.clearUsers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user and return the result from the repository without password', async () => {
      const result = await createUser();

      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          username: 'testUser',
          created_at: expect.anything(),
          updated_at: expect.anything(),
        }),
      );

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('getFullUserByUserName', () => {
    it('should get a user by username and return the result from the repository', async () => {
      const createdUser = await createUser('testUser1', 'password321');
      const result = await service.getFullUserByUserName('testUser1');

      // Ensure result includes expected fields
      expect(result).toEqual(
        expect.objectContaining({
          id: createdUser.id,
          username: 'testUser1',
          password: expect.any(String),
          created_at: expect.anything(),
          updated_at: expect.anything(),
        }),
      );
    });

    it('should throw NotFoundException if username does not exist', async () => {
      await expect(
        service.getFullUserByUserName('nonExistentUser'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserById', () => {
    it('should update a user and return the updated result from the repository', async () => {
      const createdUser = await createUser('testUser2', 'password123');
      const updatedUser = await service.updateUserById(createdUser.id, {
        username: 'updatedUser',
        password: 'newPassword123',
      });

      expect(updatedUser).toEqual(
        expect.objectContaining({
          id: createdUser.id,
          username: 'updatedUser',
          created_at: expect.anything(),
          updated_at: expect.anything(),
        }),
      );

      // Ensure the password is hashed correctly
      const fullUser = await service.getFullUserByUserName('updatedUser');
      const isPasswordMatching = await bcrypt.compare(
        'newPassword123',
        fullUser.password,
      );
      expect(isPasswordMatching).toBe(true);
    });
  });
});
