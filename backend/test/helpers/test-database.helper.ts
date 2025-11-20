import { Logger } from '@nestjs/common';
import { DatabaseService } from 'src/features/application/services/database.service';

/**
 * Helper class for managing test database state
 * Handles cleanup and provides utilities for test data management
 */
export class TestDatabaseHelper {
  private readonly logger = new Logger(TestDatabaseHelper.name);

  constructor(private readonly databaseService: DatabaseService) {}

  get prisma() {
    return this.databaseService.prisma;
  }

  /**
   * Clean all data from the database
   * Order matters: delete child records before parent records
   */
  async cleanDatabase(): Promise<void> {
    this.logger.log('Cleaning test database...');

    // Delete in order to respect foreign key constraints
    await this.prisma.passwordResetToken.deleteMany();
    await this.prisma.session.deleteMany();
    await this.prisma.customer.deleteMany();
    await this.prisma.admin.deleteMany();
    await this.prisma.account.deleteMany();
    await this.prisma.country.deleteMany();
    await this.prisma.appConfig.deleteMany();

    // Add other tables as needed

    this.logger.log('Test database cleaned');
  }

  /**
   * Seed minimal test data (countries only)
   */
  async seedMinimalData(): Promise<void> {
    await this.prisma.country.createMany({
      data: [
        {
          countryName: 'France',
          iso2Code: 'FR',
          iso3Code: 'FRA',
          num3Code: '250',
          continent: 'EU',
          continentName: 'Europe',
          currencyCode: 'EUR',
        },
        {
          countryName: 'United States',
          iso2Code: 'US',
          iso3Code: 'USA',
          num3Code: '840',
          continent: 'NA',
          continentName: 'North America',
          currencyCode: 'USD',
        },
      ],
      skipDuplicates: true,
    });
  }

  /**
   * Create a test admin account
   */
  async createTestAdmin(data: {
    email: string;
    password: string;
  }): Promise<{ id: string; accountId: string; email: string }> {
    const admin = await this.prisma.admin.create({
      data: {
        email: data.email,
        password: data.password,
        account: {
          create: {
            role: 'ADMIN',
          },
        },
      },
    });

    return admin;
  }

  /**
   * Create a test customer account
   */
  async createTestCustomer(data: {
    email: string;
    password: string;
  }): Promise<{ id: string; accountId: string; email: string }> {
    const customer = await this.prisma.customer.create({
      data: {
        email: data.email,
        password: data.password,
        account: {
          create: {
            role: 'CUSTOMER',
          },
        },
      },
    });

    return customer;
  }

  /**
   * Reset database to clean state and seed minimal data
   */
  async reset(): Promise<void> {
    await this.cleanDatabase();
    await this.seedMinimalData();
  }
}
