import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/features/application/services/database.service';
import { Account, Role } from '../../domain/entities';
import { AccountRepositoryPort } from '../../domain/ports';
import { Email } from '../../domain/value-objects';

@Injectable()
export class AccountRepository implements AccountRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  async findByEmail(email: Email): Promise<Account | null> {
    const data = await this.db.prisma.account.findFirst({
      where: {
        email: {
          equals: email.value,
          mode: 'insensitive',
        },
      },
    });

    if (!data) {
      return null;
    }

    return Account.fromPersistence({
      id: data.id,
      email: data.email,
      password: data.password,
      role: data.role as Role,
      providerId: data.providerId,
      providerAccountId: data.providerAccountId,
      isEmailVerified: data.isEmailVerified,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findById(id: string): Promise<Account | null> {
    const data = await this.db.prisma.account.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return Account.fromPersistence({
      id: data.id,
      email: data.email,
      password: data.password,
      role: data.role as Role,
      providerId: data.providerId,
      providerAccountId: data.providerAccountId,
      isEmailVerified: data.isEmailVerified,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async save(account: Account): Promise<void> {
    await this.db.prisma.account.update({
      where: { id: account.id },
      data: account.toPersistence(),
    });
  }
}
