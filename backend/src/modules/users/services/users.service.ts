import { Inject, Injectable } from '@nestjs/common';
import { User } from '../interfaces/user.interface';
import {
  UsersRepository,
  UserWithoutId,
  UserWithoutPassword,
} from '../interfaces/users.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: UsersRepository,
  ) {}

  async createUser(user: UserWithoutId): Promise<UserWithoutPassword> {
    return this.usersRepository.createUser(user);
  }

  async getFullUserByUserName(username: User['username']): Promise<User> {
    return this.usersRepository.getFullUserByUserName(username);
  }
}
