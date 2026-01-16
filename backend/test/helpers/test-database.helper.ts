import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../src/modules/shared/services/database.service';
import { TestCitiesFixture } from '../fixtures/test-cities.fixture';
import { TestUsersFixture } from '../fixtures/test-users.fixture';

/**
 * Helper class for managing test database state
 * Handles cleanup and provides utilities for test data management
 */
@Injectable()
export class TestDatabaseHelper {
  constructor(
    private readonly db: DatabaseService,
    private readonly testUsersFixture: TestUsersFixture,
    private readonly testCitiesFixture: TestCitiesFixture,
  ) {}

  /**
   * Clean all data from the database
   * Order matters: delete child records before parent records
   */
  async cleanDatabase(): Promise<void> {
    // Delete in order to respect foreign key constraints
    await this.db.prisma.account.deleteMany();
    await this.db.prisma.appConfig.deleteMany();
    await this.db.prisma.city.deleteMany();
  }

  /**
   * Seed minimal test data (countries only)
   */
  async seedMinimalData(): Promise<void> {
    await this.testCitiesFixture.seed();
    await this.testUsersFixture.seed();
  }

  /**
   * Reset database to clean state and seed minimal data
   */
  async reset(): Promise<void> {
    await this.cleanDatabase();
    await this.seedMinimalData();
  }
}
