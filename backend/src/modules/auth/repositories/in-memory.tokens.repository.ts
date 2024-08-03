import { Injectable } from '@nestjs/common';
import { TokensRepository } from '../interfaces/tokens-repository.interface';

@Injectable()
export class InMemoryTokensRepository implements TokensRepository {
  private readonly tokens = new Map<string, Date>();

  async invalidateToken(token: string): Promise<void> {
    this.tokens.set(token, new Date());
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const expiredToken = this.tokens.get(token);
    return !!expiredToken;
  }
}
