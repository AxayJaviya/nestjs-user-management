import { Test, TestingModule } from '@nestjs/testing';
import { InMemoryUsersRepository } from '../repositories/in-memory.users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user and return the result from the repository', async () => {
      const result = await createUser();

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          username: 'testUser',
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      );
    });
  });

  describe('getFullUserByUserName', () => {
    it('should get a user by username and return the result from the repository', async () => {
      await createUser('testUser1', 'password321');

      const result = await service.getFullUserByUserName('testUser1');

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          username: 'testUser1',
          password: 'password321',
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      );
    });
  });
});
