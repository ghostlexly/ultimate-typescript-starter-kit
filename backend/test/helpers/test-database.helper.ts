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
    await this.prisma.account.deleteMany();
    await this.prisma.appConfig.deleteMany();
    await this.prisma.city.deleteMany();

    // Add other tables as needed

    this.logger.log('Test database cleaned');
  }

  /**
   * Seed minimal test data (countries only)
   */
  async seedMinimalData(): Promise<void> {
    await this.prisma.city.create({
      data: {
        name: 'Marseille',
        inseeCode: '13055',
        departmentCode: '13',
        regionCode: '93',
        population: 877215,
        postalCodes: {
          createMany: {
            data: [
              {
                postalCode: '13001',
              },
              {
                postalCode: '13002',
              },
              {
                postalCode: '13003',
              },
              {
                postalCode: '13004',
              },
              {
                postalCode: '13005',
              },
              {
                postalCode: '13006',
              },
              {
                postalCode: '13007',
              },
              {
                postalCode: '13008',
              },
              {
                postalCode: '13009',
              },
              {
                postalCode: '13010',
              },
              {
                postalCode: '13011',
              },
              {
                postalCode: '13012',
              },
              {
                postalCode: '13013',
              },
              {
                postalCode: '13014',
              },
              {
                postalCode: '13015',
              },
              {
                postalCode: '13016',
              },
            ],
          },
        },
      },
    });

    await this.prisma.city.create({
      data: {
        name: "Seillons-Source-d'Argens",
        inseeCode: '83125',
        departmentCode: '83',
        regionCode: '93',
        population: 2717,
        postalCodes: {
          createMany: {
            data: [
              {
                postalCode: '83470',
              },
            ],
          },
        },
      },
    });
  }

  /**
   * Create a test admin account
   */
  async createTestAdmin(data: { email: string; password: string }) {
    const admin = await this.prisma.account.create({
      data: {
        email: data.email,
        password: data.password,
        role: 'ADMIN',
        admin: { create: {} },
      },
    });

    return admin;
  }

  /**
   * Create a test customer account
   */
  async createTestCustomer(data: { email: string; password: string }) {
    const customer = await this.prisma.account.create({
      data: {
        email: data.email,
        password: data.password,
        role: 'CUSTOMER',
        customer: { create: {} },
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
