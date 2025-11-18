import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../application/services/database.service';
import { faker } from '@faker-js/faker';

@Injectable()
export class FakeDataSeeder {
  private readonly logger = new Logger(FakeDataSeeder.name);

  constructor(private readonly db: DatabaseService) {}

  async seed(options: { customers?: number } = {}): Promise<void> {
    this.logger.log('Starting fake data seed...');

    const { customers = 10 } = options;

    await this.seedFakeCustomers(customers);

    this.logger.log('Fake data seed completed successfully');
  }

  private async seedFakeCustomers(count: number): Promise<void> {
    this.logger.log(`Creating ${count} fake customers...`);

    let created = 0;
    let skipped = 0;

    for (let i = 0; i < count; i++) {
      try {
        const email = faker.internet.email().toLowerCase();
        const password = await this.hashPassword('Password123!');

        await this.db.prisma.customer.create({
          data: {
            email,
            password,
            account: {
              create: {
                role: 'CUSTOMER',
              },
            },
          },
        });

        created++;
      } catch (error) {
        if (error.code === 'P2002') {
          skipped++;
        } else {
          this.logger.error(`Failed to create fake customer: ${error.message}`);
          skipped++;
        }
      }
    }

    this.logger.log(
      `Fake customers created: ${created} created, ${skipped} skipped`,
    );
  }

  private async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcrypt');

    return bcrypt.hash(password, 10);
  }

  async clean(): Promise<void> {
    this.logger.log('Cleaning fake data...');

    // Clean only fake customers (not the test ones with specific emails)
    const result = await this.db.prisma.customer.deleteMany({
      where: {
        NOT: {
          email: {
            in: ['customer@test.com', 'customer2@test.com'],
          },
        },
      },
    });

    this.logger.log(`Cleaned ${result.count} fake customers`);
  }
}
