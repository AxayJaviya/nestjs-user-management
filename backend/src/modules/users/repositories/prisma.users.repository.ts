import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import { User } from '../interfaces/user.interface';
import {
  UsersRepository,
  UserWithoutId,
  UserWithoutPassword,
} from '../interfaces/users.repository';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  clearUsers(): void {
    throw new Error('Not implemented!');
  }

  async createUser(user: UserWithoutId): Promise<UserWithoutPassword> {
    // Check if a user with the same username already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username: user.username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists!');
    }

    // Create a new user
    const createdUser = await this.prisma.user.create({
      data: {
        ...user,
      },
    });

    // Exclude the password field from the returned user object
    const { password: _password, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }

  async getFullUserByUserName(username: User['username']): Promise<User> {
    const existedUser = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!existedUser) {
      throw new NotFoundException('User not found!');
    }

    return existedUser;
  }

  async getUserById(id: User['id']): Promise<UserWithoutPassword> {
    const existedUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existedUser) {
      throw new NotFoundException('User not found!');
    }

    const { password: _password, ...userWithoutPassword } = existedUser;
    return userWithoutPassword;
  }

  async updateUserById(
    id: User['id'],
    user: Partial<User>,
  ): Promise<UserWithoutPassword> {
    // Check if the user with the given id exists
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found!');
    }

    // Validate and handle unique constraints for the username
    if (user.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: {
          username: user.username,
        },
      });

      if (existingUsername && existingUsername.id !== id) {
        throw new BadRequestException(
          'Username is already taken, please choose another username!',
        );
      }
    }

    // Update the user's data
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...user,
      },
    });

    const { password: _password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
