export interface TokensRepository {
  invalidateToken(token: string): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
}
