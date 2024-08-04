import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'node:process';
import { PrismaModule } from '../prisma/prisma.module';
import { InMemoryUsersRepository } from '../users/repositories/in-memory.users.repository';
import { PrismaUsersRepository } from '../users/repositories/prisma.users.repository';
import { UsersService } from '../users/services/users.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { InMemoryTokensRepository } from './repositories/in-memory.tokens.repository';
import { PrismaTokensRepository } from './repositories/prisma.tokens.repository';
import { AuthService } from './services/auth.service';
import { TokensService } from './services/tokens.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_TOKEN_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [
    TokensService,
    {
      provide: 'TokensRepository',
      useClass:
        process.env.NODE_ENV === 'test'
          ? InMemoryTokensRepository
          : PrismaTokensRepository,
    },
    AuthService,
    UsersService,
    {
      provide: 'UsersRepository',
      useClass:
        process.env.NODE_ENV === 'test'
          ? InMemoryUsersRepository
          : PrismaUsersRepository,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
