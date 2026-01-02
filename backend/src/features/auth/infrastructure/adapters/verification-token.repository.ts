import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/features/application/services/database.service';
import { VerificationToken, VerificationType } from '../../domain/entities';
import { VerificationTokenRepositoryPort } from '../../domain/ports';

@Injectable()
export class VerificationTokenRepository
  implements VerificationTokenRepositoryPort
{
  constructor(private readonly db: DatabaseService) {}

  async findByTokenAndType(
    token: string,
    type: VerificationType,
    accountEmail?: string,
  ): Promise<VerificationToken | null> {
    const data = await this.db.prisma.verificationToken.findFirst({
      where: {
        token,
        type,
        expiresAt: {
          gte: new Date(),
        },
        ...(accountEmail && {
          account: {
            email: accountEmail,
          },
        }),
      },
    });

    if (!data) {
      return null;
    }

    return VerificationToken.fromPersistence({
      id: data.id,
      token: data.token,
      type: data.type as VerificationType,
      value: data.value,
      accountId: data.accountId,
      expiresAt: data.expiresAt,
    });
  }

  async findByAccountIdAndType(
    accountId: string,
    type: VerificationType,
  ): Promise<VerificationToken | null> {
    const data = await this.db.prisma.verificationToken.findFirst({
      where: {
        accountId,
        type,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!data) {
      return null;
    }

    return VerificationToken.fromPersistence({
      id: data.id,
      token: data.token,
      type: data.type as VerificationType,
      value: data.value,
      accountId: data.accountId,
      expiresAt: data.expiresAt,
    });
  }

  async save(token: VerificationToken): Promise<void> {
    const data = token.toPersistence();

    await this.db.prisma.verificationToken.upsert({
      where: { id: token.id },
      create: data,
      update: data,
    });
  }

  async deleteByAccountIdAndType(
    accountId: string,
    type: VerificationType,
  ): Promise<void> {
    await this.db.prisma.verificationToken.deleteMany({
      where: {
        accountId,
        type,
      },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.db.prisma.verificationToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}
