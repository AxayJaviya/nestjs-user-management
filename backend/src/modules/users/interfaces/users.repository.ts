import { User } from './user.interface';

export type UserWithoutId = Omit<User, 'id'>;
export type UserWithoutPassword = Omit<User, 'password'>;

export interface UsersRepository {
  createUser(user: UserWithoutId): UserWithoutPassword;
  getUserById(id: User['id']): UserWithoutPassword;
  updateUserById(id: User['id'], user: Partial<User>): UserWithoutPassword;
  getFullUserByUserName(username: User['username']): User;
  clearUsers(): void;
}
