import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuthGuard } from '../../../guards/auth.guard';
import { InMemoryTokensRepository } from '../../auth/repositories/in-memory.tokens.repository';
import { TokensService } from '../../auth/services/tokens.service';
import { UpdateUserProfileDto } from '../dtos/updateUserProfile.dto';
import { InMemoryUsersRepository } from '../repositories/in-memory.users.repository';
import { UsersService } from '../services/users.service';
import { UsersController } from './users.controller';

// Mocks
const mockJwtService = {
  verifyAsync: jest.fn().mockResolvedValue({ id: 1, username: 'username' }),
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  // variables
  const username = 'username';
  const password = 'password123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        ConfigService,
        TokensService,
        { provide: 'TokensRepository', useClass: InMemoryTokensRepository },
        UsersService,
        { provide: 'UsersRepository', useClass: InMemoryUsersRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AuthGuard, useValue: { canActivate: jest.fn(() => true) } }, // Simplified AuthGuard mock
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    // Clear users in the repository before each test
    await usersService.clearUsers();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const createdUser = await usersService.createUser({
        username,
        password,
      });
      const { id } = createdUser;

      const mockRequest = { user: { id } } as unknown as Request;
      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual({
        id,
        username,
        created_at: expect.anything(),
        updated_at: expect.anything(),
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const createdUser = await usersService.createUser({
        username,
        password,
      });
      const { id } = createdUser;
      const updatedUsername = 'updated-user';

      const mockRequest = { user: { id } } as unknown as Request;
      const updateDto: UpdateUserProfileDto = { username: updatedUsername };
      const result = await controller.updateProfile(mockRequest, updateDto);

      expect(result).toEqual({
        id,
        username: updatedUsername,
        created_at: expect.anything(),
        updated_at: expect.anything(),
      });
    });
  });
});
