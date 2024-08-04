import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import { FileStorage } from '../../utils/fileStorage';
import { User } from '../interfaces/user.interface';
import {
  UsersRepository,
  UserWithoutId,
  UserWithoutPassword,
} from '../interfaces/users.repository';

@Injectable()
export class InMemoryUsersRepository implements UsersRepository {
  private readonly filePath: string;
  private users: User[];

  constructor() {
    this.filePath = path.resolve(__dirname, 'data', 'users.json');
    FileStorage.ensureDirectoryExistence(this.filePath);
    this.users = this.loadUsers();
  }

  clearUsers(): void {
    this.users = [];
    this.saveUsers();
  }

  async createUser(user: UserWithoutId): Promise<UserWithoutPassword> {
    this.reloadUsers();

    const lowerCaseUsername = user.username.toLowerCase();
    const existingUser = this.users.find(
      (u) => u.username.toLowerCase() === lowerCaseUsername,
    );

    if (existingUser) {
      throw new BadRequestException(
        'Username is already taken, please choose another username',
      );
    }

    const id = this.getMaxIndex() + 1;
    const now = new Date();
    const newUser: User = {
      ...user,
      id,
      created_at: now,
      updated_at: now,
    };
    this.users.push(newUser);
    this.saveUsers();

    return this.excludePassword(newUser);
  }

  async getUserById(id: User['id']): Promise<UserWithoutPassword> {
    this.reloadUsers();

    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User not found!`);
    }
    return this.excludePassword(user);
  }

  async updateUserById(
    id: User['id'],
    user: Partial<User>,
  ): Promise<UserWithoutPassword> {
    this.reloadUsers();

    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new NotFoundException(`User not found!`);
    }

    const lowerCaseUsername = user.username?.toLowerCase();
    if (lowerCaseUsername) {
      const existingUser = this.users.find(
        (u) => u.username.toLowerCase() === lowerCaseUsername && u.id !== id,
      );

      if (existingUser) {
        throw new BadRequestException(
          'User with given username already exists, please choose another username',
        );
      }
    }

    const now = new Date();
    this.users[index] = { ...this.users[index], ...user, updated_at: now };
    this.saveUsers();

    return this.excludePassword(this.users[index]);
  }

  async getFullUserByUserName(username: User['username']): Promise<User> {
    this.reloadUsers();

    const user = this.users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
    if (!user) {
      throw new NotFoundException(`User not found!`);
    }
    return user;
  }

  getMaxIndex(): number {
    return this.users.reduce((max, user) => Math.max(max, user.id), 0);
  }

  private excludePassword(user: User): UserWithoutPassword {
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private reloadUsers(): void {
    this.users = this.loadUsers();
  }

  private loadUsers(): User[] {
    return FileStorage.loadFromFile<User>(this.filePath);
  }

  private saveUsers(): void {
    FileStorage.saveToFile(this.filePath, this.users);
  }
}
