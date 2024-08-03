import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { FileStorage } from '../../utils/fileStorage';
import { TokensRepository } from '../interfaces/tokens-repository.interface';

@Injectable()
export class InMemoryTokensRepository implements TokensRepository {
  private readonly filePath: string;
  private tokens: Map<string, Date>;

  constructor() {
    this.filePath = path.resolve(__dirname, 'data', 'tokens.json');
    FileStorage.ensureDirectoryExistence(this.filePath);
    this.tokens = this.loadTokens();
  }

  async invalidateToken(token: string): Promise<void> {
    this.tokens.set(token, new Date());

    this.saveTokens();
  }

  async isBlacklisted(token: string): Promise<boolean> {
    this.tokens = this.loadTokens();

    return this.tokens.has(token);
  }

  private loadTokens(): Map<string, Date> {
    try {
      const tokensData = FileStorage.loadFromFile<{
        token: string;
        date: string;
      }>(this.filePath);
      return new Map(
        tokensData.map(({ token, date }) => [token, new Date(date)]),
      );
    } catch (error) {
      throw new Error('Failed to load tokens!');
    }
  }

  private saveTokens(): void {
    try {
      const tokensArray = Array.from(this.tokens.entries()).map(
        ([token, date]) => ({
          token,
          date: date.toISOString(),
        }),
      );
      FileStorage.saveToFile(this.filePath, tokensArray);
    } catch (error) {
      throw new Error('Failed to save tokens!');
    }
  }
}
