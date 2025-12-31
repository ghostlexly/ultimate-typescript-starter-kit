import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/features/application/services/database.service';
import { Customer } from '../../domain/entities';
import { CustomerRepositoryPort } from '../../domain/ports';

@Injectable()
export class CustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

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

  async save(customer: Customer): Promise<void> {
    await this.db.prisma.customer.update({
      where: { id: customer.id },
      data: customer.toPersistence(),
    });
  }
}
