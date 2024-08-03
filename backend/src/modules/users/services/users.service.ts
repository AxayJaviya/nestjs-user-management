import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as process from 'node:process';
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

  async getUserById(id: User['id']): Promise<UserWithoutPassword> {
    return this.usersRepository.getUserById(id);
  }

  async updateUserById(
    id: User['id'],
    user: Partial<User>,
  ): Promise<UserWithoutPassword> {
    const updateUser = { ...user };
    if (user.password) {
      updateUser.password = await this.hashPassword(user.password);
    }

    return this.usersRepository.updateUserById(id, updateUser);
  }

  async getFullUserByUserName(username: User['username']): Promise<User> {
    return this.usersRepository.getFullUserByUserName(username);
  }

  async clearUsers() {
    if (process.env.NODE_ENV === 'test') {
      this.usersRepository.clearUsers();
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
