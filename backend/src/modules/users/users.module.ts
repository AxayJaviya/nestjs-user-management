import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as process from 'node:process';
import { InMemoryTokensRepository } from '../auth/repositories/in-memory.tokens.repository';
import { PrismaTokensRepository } from '../auth/repositories/prisma.tokens.repository';
import { TokensService } from '../auth/services/tokens.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './controllers/users.controller';
import { InMemoryUsersRepository } from './repositories/in-memory.users.repository';
import { PrismaUsersRepository } from './repositories/prisma.users.repository';
import { UsersService } from './services/users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    JwtService,
    TokensService,
    {
      provide: 'TokensRepository',
      useClass:
        process.env.NODE_ENV === 'test'
          ? InMemoryTokensRepository
          : PrismaTokensRepository,
    },
    UsersService,
    {
      provide: 'UsersRepository',
      useClass:
        process.env.NODE_ENV === 'test'
          ? InMemoryUsersRepository
          : PrismaUsersRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
