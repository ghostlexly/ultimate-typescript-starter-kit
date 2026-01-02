import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from 'src/features/application/services/database.service';
import { Customer } from '../../domain/entities';
import { CustomerRepositoryPort } from '../../domain/ports';

@Injectable()
export class CustomerRepository implements CustomerRepositoryPort {
  constructor(
    private readonly db: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const data = await this.db.prisma.customer.findUnique({
      where: { id },
      include: { account: true },
    });

    if (!data) {
      return null;
    }

    return Customer.fromPersistence({
      id: data.id,
      accountId: data.accountId,
      email: data.account.email,
      countryCode: data.countryCode,
      cityId: data.cityId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findByAccountId(accountId: string): Promise<Customer | null> {
    const data = await this.db.prisma.customer.findFirst({
      where: { accountId },
      include: { account: true },
    });

    if (!data) {
      return null;
    }

    return Customer.fromPersistence({
      id: data.id,
      accountId: data.accountId,
      email: data.account.email,
      countryCode: data.countryCode,
      cityId: data.cityId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async create(customer: Customer): Promise<void> {
    await this.db.prisma.customer.create({
      data: {
        id: customer.id,
        accountId: customer.accountId,
        countryCode: customer.countryCode,
        cityId: customer.cityId,
      },
    });

    // Publish domain events after successful persistence
    for (const event of customer.domainEvents) {
      this.eventEmitter.emit(event.eventName, event);
    }

    customer.clearDomainEvents();
  }

  async save(customer: Customer): Promise<void> {
    await this.db.prisma.customer.update({
      where: { id: customer.id },
      data: customer.toPersistence(),
    });

    // Publish domain events after successful persistence
    for (const event of customer.domainEvents) {
      this.eventEmitter.emit(event.eventName, event);
    }

    customer.clearDomainEvents();
  }
}
