import { Command, CommandRunner, Option } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { CountriesSeeder } from '../seeders/countries.seeder';
import { UsersSeeder } from '../seeders/users.seeder';
import { FakeDataSeeder } from '../seeders/fake-data.seeder';

interface SeedOptions {
  fakeData?: boolean;
  fakeCustomers?: number;
}

@Command({
  name: 'seed',
  description: 'Seed all data (countries, users, and optionally fake data)',
})
export class SeedCommand extends CommandRunner {
  private readonly logger = new Logger(SeedCommand.name);

  constructor(
    private readonly countriesSeeder: CountriesSeeder,
    private readonly usersSeeder: UsersSeeder,
    private readonly fakeDataSeeder: FakeDataSeeder,
  ) {
    super();
  }

  async run(_passedParams: string[], options?: SeedOptions): Promise<void> {
    this.logger.log('🌱 Starting database seeding...\n');

    try {
      // Seed countries
      this.logger.log('📍 Seeding countries...');
      await this.countriesSeeder.seed();

      // Seed users
      this.logger.log('\n👥 Seeding test users...');
      await this.usersSeeder.seed();
      this.usersSeeder.getTestCredentials();

      // Seed fake data (optional)
      if (options?.fakeData) {
        const customers = options.fakeCustomers || 10;

        this.logger.log('\n🎲 Seeding fake data...');
        await this.fakeDataSeeder.seed({ customers });
      }

      this.logger.log('\n✓ All seeding completed successfully! 🎉');
    } catch (error) {
      this.logger.error(`\n✗ Seeding failed: ${error.message}`);
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
