import { Injectable } from '@nestjs/common';
import { User } from '../interfaces/user.interface';
import {
  UsersRepository,
  UserWithoutId,
  UserWithoutPassword,
} from '../interfaces/users.repository';

@Injectable()
export class InMemoryUsersRepository implements UsersRepository {
  private readonly users: User[] = [];

  createUser(user: UserWithoutId): UserWithoutPassword {
    const id = this.getMaxIndex() + 1;
    const now = new Date();
    const newUser: User = {
      ...user,
      id,
      created_at: now,
      updated_at: now,
    };
    this.users.push(newUser);

    return this.excludePassword(newUser);
  }

  getUserById(id: User['id']): UserWithoutPassword {
    const index = this.users.findIndex((user) => user.id === id);
    return this.excludePassword(this.users[index]);
  }

  updateUserById(id: User['id'], user: Partial<User>): UserWithoutPassword {
    const index = this.users.findIndex((user) => user.id === id);
    const now = new Date();
    this.users[index] = { ...this.users[index], ...user, updated_at: now };

    return this.excludePassword(this.users[index]);
  }

  getFullUserByUserName(username: User['username']): User {
    return this.users.find((user) => user.username === username);
  }

  private getMaxIndex(): number {
    return this.users.reduce((max, user) => Math.max(max, user.id), 0);
  }

  private excludePassword(user: User): UserWithoutPassword {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
