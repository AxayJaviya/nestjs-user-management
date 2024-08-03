import { InMemoryTokensRepository } from './in-memory.tokens.repository';

describe('InMemoryTokensRepository', () => {
  let repository: InMemoryTokensRepository;

  beforeEach(() => {
    repository = new InMemoryTokensRepository();
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
