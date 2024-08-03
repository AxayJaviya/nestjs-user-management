import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as process from 'node:process';
import { InMemoryUsersRepository } from '../users/repositories/in-memory.users.repository';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [ConfigModule, UsersModule],
  providers: [
    AuthService,
    JwtService,
    {
      provide: 'UsersRepository',
      useClass:
        process.env.NODE_ENV === 'test'
          ? InMemoryUsersRepository
          : InMemoryUsersRepository,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
