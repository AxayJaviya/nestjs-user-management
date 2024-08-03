import * as fs from 'fs';
import * as path from 'path';
import { InMemoryTokensRepository } from './in-memory.tokens.repository';

describe('InMemoryTokensRepository', () => {
  let repository: InMemoryTokensRepository;
  const filePath = path.resolve(__dirname, 'data', 'tokens.json');

  // Helper function to clear the file
  const clearFile = () => {
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }
  };

  beforeEach(() => {
    repository = new InMemoryTokensRepository();
    clearFile();
  });

  afterEach(() => {
    // To ensure, a file is cleared after each test
    clearFile();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('invalidateToken', () => {
    it('should add a token to the blacklist', async () => {
      const token = 'test-token';
      await repository.invalidateToken(token);
      expect(await repository.isBlacklisted(token)).toBe(true);
    });
  });

  describe('isBlacklisted', () => {
    it('should return true for a blacklisted token', async () => {
      const token = 'test-token';
      await repository.invalidateToken(token);
      expect(await repository.isBlacklisted(token)).toBe(true);
    });

    it('should return false for a non-blacklisted token', async () => {
      expect(await repository.isBlacklisted('non-existent-token')).toBe(false);
    });
  });
});
