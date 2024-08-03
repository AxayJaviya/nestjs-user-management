import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../interfaces/user.interface';
import { UserWithoutId } from '../interfaces/users.repository';
import { InMemoryUsersRepository } from './in-memory.users.repository';

describe('InMemoryUsersRepository', () => {
  let repository: InMemoryUsersRepository;
  const filePath = path.join(__dirname, 'data/users.json');

  beforeEach(() => {
    repository = new InMemoryUsersRepository();
    // Clean up the file before each test to ensure no residual data
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  afterEach(() => {
    // Ensure the file is cleaned up after each test
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  it('should create a user with a given username and password', () => {
    const userWithoutId: UserWithoutId = {
      username: 'testuser',
      password: 'password123',
    };

    const result = repository.createUser(userWithoutId);

    // Validate overall structure
    expect(result).toEqual({
      id: expect.any(Number),
      username: 'testuser',
      created_at: expect.anything(),
      updated_at: expect.anything(),
    });

    // Ensure the password is not included in the result
    expect(result).not.toHaveProperty('password');
  });

  it('should throw BadRequestException if username already exists', () => {
    const userWithoutId: UserWithoutId = {
      username: 'testuser',
      password: 'password123',
    };
    repository.createUser(userWithoutId);

    const newUserWithoutId: UserWithoutId = {
      username: 'testuser',
      password: 'newpassword456',
    };

    expect(() => repository.createUser(newUserWithoutId)).toThrow(
      BadRequestException,
    );
  });

  it('should update a user for a given userId', () => {
    const userWithoutId: UserWithoutId = {
      username: 'testuser',
      password: 'password123',
    };
    const { id } = repository.createUser(userWithoutId);

    const updateData: Partial<User> = { username: 'updateduser' };
    const result = repository.updateUserById(id, updateData);

    expect(result).toEqual({
      id: 1,
      username: 'updateduser',
      created_at: expect.anything(),
      updated_at: expect.anything(),
    });
    expect(result).not.toHaveProperty('password');
  });

  it('should throw NotFoundException if trying to update a non-existent user', () => {
    const updateData: Partial<User> = { username: 'updateduser' };
    expect(() => repository.updateUserById(999, updateData)).toThrow(
      NotFoundException,
    );
  });

  it('should get a full user by username', () => {
    const userWithoutId: UserWithoutId = {
      username: 'testuser',
      password: 'password123',
    };
    repository.createUser(userWithoutId);

    const result = repository.getFullUserByUserName('testuser');

    expect(result).toEqual({
      id: 1,
      username: 'testuser',
      password: 'password123',
      created_at: expect.anything(),
      updated_at: expect.anything(),
    });
  });

  it('should throw NotFoundException if username does not exist', () => {
    expect(() => repository.getFullUserByUserName('nonexistent')).toThrow(
      NotFoundException,
    );
  });

  it('should get a user by id and exclude the password', () => {
    const userWithoutId: UserWithoutId = {
      username: 'testuser',
      password: 'password123',
    };
    const { id } = repository.createUser(userWithoutId);

    const result = repository.getUserById(id);

    expect(result).toEqual({
      id: 1,
      username: 'testuser',
      created_at: expect.anything(),
      updated_at: expect.anything(),
    });
    expect(result).not.toHaveProperty('password');
  });

  it('should throw NotFoundException if user id does not exist', () => {
    expect(() => repository.getUserById(999)).toThrow(NotFoundException);
  });

  it('should return the correct maximum index', () => {
    repository.clearUsers();
    repository.createUser({
      username: 'user1',
      password: 'password1',
    });
    repository.createUser({
      username: 'user2',
      password: 'password2',
    });

    const result = repository.getMaxIndex();
    expect(result).toBe(2);
  });
});
