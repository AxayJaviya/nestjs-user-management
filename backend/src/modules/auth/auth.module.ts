import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'node:process';
import { InMemoryUsersRepository } from '../users/repositories/in-memory.users.repository';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { InMemoryTokensRepository } from './repositories/in-memory.tokens.repository';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    ConfigModule,
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
    TokenService,
    {
      provide: 'TokensRepository',
      useClass:
        process.env.NODE_ENV === 'test'
          ? InMemoryTokensRepository
          : InMemoryTokensRepository,
    },
    AuthService,
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
