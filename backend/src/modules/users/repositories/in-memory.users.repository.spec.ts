import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../interfaces/user.interface';
import { UserWithoutId } from '../interfaces/users.repository';
import { InMemoryUsersRepository } from './in-memory.users.repository';

describe('InMemoryUsersRepository', () => {
  let repository: InMemoryUsersRepository;
  const filePath = path.join(__dirname, 'data/users.json');

  beforeEach(async () => {
    repository = new InMemoryUsersRepository();
    // Clean up the file before each test to ensure no residual data
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  it('should create a user with a given username and password', async () => {
    const userWithoutId: UserWithoutId = {
      username: 'testuser',
      password: 'password123',
    };

    const result = await repository.createUser(userWithoutId);

    expect(result).toEqual({
      id: expect.any(Number),
      username: 'testuser',
      created_at: expect.anything(),
      updated_at: expect.anything(),
    });

    expect(result).not.toHaveProperty('password');
  });

  it('should throw BadRequestException if username already exists', async () => {
    const userWithoutId: UserWithoutId = {
      username: 'testuser',
      password: 'password123',
    };
    await repository.createUser(userWithoutId);

    const newUserWithoutId: UserWithoutId = {
      username: 'testuser',
      password: 'newpassword456',
    };

    await expect(repository.createUser(newUserWithoutId)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should update a user for a given userId', async () => {
    const userWithoutId: UserWithoutId = {
      username: 'testuser',
      password: 'password123',
    };
    const { id } = await repository.createUser(userWithoutId);

    const updateData: Partial<User> = { username: 'updateduser' };
    const result = await repository.updateUserById(id, updateData);

    expect(result).toEqual({
      id,
      username: 'updateduser',
      created_at: expect.anything(),
      updated_at: expect.anything(),
    });

    expect(result).not.toHaveProperty('password');
  });

  it('should throw NotFoundException if trying to update a non-existent user', async () => {
    const updateData: Partial<User> = { username: 'updateduser' };
    await expect(repository.updateUserById(999, updateData)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should get a full user by username', async () => {
    const userWithoutId: UserWithoutId = {
      username: 'testuser',
      password: 'password123',
    };
    await repository.createUser(userWithoutId);

    const result = await repository.getFullUserByUserName('testuser');

    expect(result).toEqual({
      id: 1,
      username: 'testuser',
      password: 'password123',
      created_at: expect.anything(),
      updated_at: expect.anything(),
    });
  });

  it('should throw NotFoundException if username does not exist', async () => {
    await expect(
      repository.getFullUserByUserName('nonexistent'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should get a user by id and exclude the password', async () => {
    const userWithoutId: UserWithoutId = {
      username: 'testuser',
      password: 'password123',
    };
    const { id } = await repository.createUser(userWithoutId);

    const result = await repository.getUserById(id);

    expect(result).toEqual({
      id,
      username: 'testuser',
      created_at: expect.anything(),
      updated_at: expect.anything(),
    });

    expect(result).not.toHaveProperty('password');
  });

  it('should throw NotFoundException if user id does not exist', async () => {
    await expect(repository.getUserById(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return the correct maximum index', async () => {
    await repository.clearUsers();
    await repository.createUser({
      username: 'user1',
      password: 'password1',
    });
    await repository.createUser({
      username: 'user2',
      password: 'password2',
    });

    const result = repository.getMaxIndex();
    expect(result).toBe(2);
  });
});
