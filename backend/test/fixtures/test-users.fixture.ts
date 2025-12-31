import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../src/features/application/services/database.service';
import { passwordUtils } from '../../src/core/utils/password';

export const TEST_USERS = {
  admin: {
    email: 'e2e-admin@test.com',
    password: 'TestAdmin123!',
    role: 'ADMIN' as const,
  },
  customer: {
    email: 'e2e-customer@test.com',
    password: 'TestCustomer123!',
    role: 'CUSTOMER' as const,
  },
  customer2: {
    email: 'e2e-customer2@test.com',
    password: 'TestCustomer123!',
    role: 'CUSTOMER' as const,
  },
} as const;

export async function getHashedPassword(password: string): Promise<string> {
  return passwordUtils.hash(password);
}

@Injectable()
export class TestUsersFixture {
  constructor(private readonly db: DatabaseService) {}

  async seed(): Promise<void> {
    await this.seedAdmin();
    await this.seedCustomers();
  }

  private async seedAdmin(): Promise<void> {
    const hashedPassword = await getHashedPassword(TEST_USERS.admin.password);

    await this.db.prisma.account.create({
      data: {
        email: TEST_USERS.admin.email,
        password: hashedPassword,
        role: 'ADMIN',
        admin: { create: {} },
      },
    });
  }

  private async seedCustomers(): Promise<void> {
    const hashedPassword = await getHashedPassword(
      TEST_USERS.customer.password,
    );

    await this.db.prisma.account.create({
      data: {
        email: TEST_USERS.customer.email,
        password: hashedPassword,
        role: 'CUSTOMER',
        customer: {
          create: {},
        },
      },
    });

    const hashedPassword2 = await getHashedPassword(
      TEST_USERS.customer2.password,
    );

    await this.db.prisma.account.create({
      data: {
        email: TEST_USERS.customer2.email,
        password: hashedPassword2,
        role: 'CUSTOMER',
        customer: {
          create: {},
        },
      },
    });
  }
}
