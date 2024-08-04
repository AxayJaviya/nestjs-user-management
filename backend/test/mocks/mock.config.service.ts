export class MockConfigService {
  get(key: string): string {
    if (key === 'JWT_TOKEN_SECRET') {
      return 'test-secret-key';
    }
    return '';
  }
}
