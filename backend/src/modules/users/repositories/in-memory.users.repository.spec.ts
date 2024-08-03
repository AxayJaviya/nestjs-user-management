import { User } from '../interfaces/user.interface';
import { UserWithoutId } from '../interfaces/users.repository';
import { InMemoryUsersRepository } from './in-memory.users.repository';

describe('InMemoryUsersRepository', () => {
  let repository: InMemoryUsersRepository;

  beforeEach(() => {
    repository = new InMemoryUsersRepository();
  });

  it('should create a user using given username and password', () => {
    const userWithoutId: UserWithoutId = {
      username: 'testuser',
      password: 'password123',
    };

    const result = repository.createUser(userWithoutId);

    expect(result).toEqual({
      id: 1,
      username: 'testuser',
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    });
    expect(result).not.toHaveProperty('password');
  });

  it('should update a user for given userId', () => {
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
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    });
    expect(result).not.toHaveProperty('password');
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
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    });
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
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    });
    expect(result).not.toHaveProperty('password');
  });

  it('should return the correct maximum index', () => {
    const user1: User = {
      id: 1,
      username: 'user1',
      password: 'password1',
      created_at: new Date(),
      updated_at: new Date(),
    };
    const user2: User = {
      id: 2,
      username: 'user2',
      password: 'password2',
      created_at: new Date(),
      updated_at: new Date(),
    };
    repository['users'].push(user1, user2);

    const result = repository['getMaxIndex']();

    expect(result).toBe(2);
  });
});
