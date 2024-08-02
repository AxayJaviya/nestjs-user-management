export class PrismaServiceMock {
  user = {
    get: jest.fn().mockResolvedValue({
      id: 1,
      username: 'testUser',
      name: '#passwordHash',
    }),
    create: jest.fn().mockResolvedValue({
      id: 1,
      username: 'testUser',
      password: '#passwordHash',
    }),
  };

  async $connect() {
    // Mock the connect method if needed
  }
}
