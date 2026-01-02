import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from 'src/features/application/services/database.service';
import { Account, Role } from '../../domain/entities';
import { AccountRepositoryPort } from '../../domain/ports';

@Injectable()
export class AccountRepository implements AccountRepositoryPort {
  constructor(
    private readonly db: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findByEmail(email: string): Promise<Account | null> {
    const data = await this.db.prisma.account.findFirst({
      where: {
        email: {
          equals: email,
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
    });
  }

  async create(account: Account): Promise<void> {
    const data = account.toPersistence();

    await this.db.prisma.account.create({
      data,
    });

    // Publish domain events after successful persistence
    for (const event of account.domainEvents) {
      this.eventEmitter.emit(event.eventName, event);
    }

    account.clearDomainEvents();
  }

  async save(account: Account): Promise<void> {
    const data = account.toPersistence();

    await this.db.prisma.account.update({
      where: { id: account.id },
      data,
    });

    // Publish domain events after successful persistence
    for (const event of account.domainEvents) {
      this.eventEmitter.emit(event.eventName, event);
    }

    account.clearDomainEvents();
  }
}
