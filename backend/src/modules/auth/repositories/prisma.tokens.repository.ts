import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import { TokensRepository } from '../interfaces/tokens-repository.interface';

@Injectable()
export class PrismaTokensRepository implements TokensRepository {
  constructor(private prisma: PrismaService) {}

  async invalidateToken(token: string): Promise<void> {
    await this.prisma.blacklistedToken.create({
      data: {
        token,
      },
    });
    return;
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.prisma.blacklistedToken.findUnique({
      where: {
        token: token,
      },
    });

    return !!result;
  }
}
