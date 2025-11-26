import { Command, CommandRunner, Option } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { UsersSeeder } from '../seeders/users.seeder';
import { FakeDataSeeder } from '../seeders/fake-data.seeder';
import { CitiesSeeder } from '../seeders/cities.seeder';

interface SeedOptions {
  fakeData?: boolean;
  fakeCustomers?: number;
}

@Command({
  name: 'seed',
  description: 'Seed all data (users, and optionally fake data)',
})
export class SeedCommand extends CommandRunner {
  private logger = new Logger(SeedCommand.name);

  constructor(
    private usersSeeder: UsersSeeder,
    private citiesSeeder: CitiesSeeder,
    private fakeDataSeeder: FakeDataSeeder,
  ) {
    super();
  }

  async run(_passedParams: string[], options?: SeedOptions): Promise<void> {
    this.logger.debug('🌱 Starting database seeding...');

    try {
      // Seed users
      this.logger.debug('👥 Seeding test users...');
      await this.usersSeeder.seed();
      this.usersSeeder.getTestCredentials();

      // Seed cities
      this.logger.debug('🌍 Seeding cities...');
      await this.citiesSeeder.seed();

      // Seed fake data (optional)
      if (options?.fakeData) {
        const customers = options.fakeCustomers || 10;

        this.logger.debug('🎲 Seeding fake data...');
        await this.fakeDataSeeder.seed({ customers });
      }

      this.logger.debug('✓ All seeding completed successfully! 🎉');
    } catch (error) {
      this.logger.error(`✗ Seeding failed: ${error.message}`);
      throw error;
    }
  }

  @Option({
    flags: '--fake-data',
    description: 'Include fake data seeding',
  })
  parseFakeData(): boolean {
    return true;
  }

  @Option({
    flags: '--fake-customers <number>',
    description:
      'Number of fake customers to create (requires --include-fake-data, default: 10)',
  })
  parseFakeCustomers(val: string): number {
    return Number(val);
  }
}
