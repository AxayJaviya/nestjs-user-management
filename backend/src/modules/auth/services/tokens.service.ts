import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokensRepository } from '../interfaces/tokens-repository.interface';
import { Tokens } from './auth.service';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('TokensRepository')
    private readonly tokenRepository: TokensRepository,
  ) {}

  async invalidateToken(token: Tokens['accessToken']) {
    const decodedToken = this.jwtService.decode(token) as any;
    if (!decodedToken) {
      throw new UnauthorizedException('Invalid token!');
    }

    await this.tokenRepository.invalidateToken(token);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    return this.tokenRepository.isBlacklisted(token);
  }
}
