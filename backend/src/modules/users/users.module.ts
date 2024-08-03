import { Module } from '@nestjs/common';
import * as process from 'node:process';
import { UsersController } from './controllers/users.controller';
import { InMemoryUsersRepository } from './repositories/in-memory.users.repository';
import { UsersService } from './services/users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'UsersRepository',
      useClass:
        process.env.NODE_ENV === 'test'
          ? InMemoryUsersRepository
          : InMemoryUsersRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
