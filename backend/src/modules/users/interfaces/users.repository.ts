import { User } from './user.interface';

export type UserWithoutId = Omit<User, 'id'>;
export type UserWithoutPassword = Omit<User, 'password'>;

export interface UsersRepository {
  createUser(user: UserWithoutId): Promise<UserWithoutPassword>;
  getUserById(id: User['id']): Promise<UserWithoutPassword>;
  updateUserById(
    id: User['id'],
    user: Partial<User>,
  ): Promise<UserWithoutPassword>;
  getFullUserByUserName(username: User['username']): Promise<User>;
  clearUsers(): void;
}
