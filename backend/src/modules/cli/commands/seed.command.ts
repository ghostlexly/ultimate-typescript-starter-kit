import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { UsersSeeder } from '../seeders/users.seeder';
import { CitiesSeeder } from '../seeders/cities.seeder';

@Command({
  name: 'seed',
  description: 'Seed all data',
})
export class SeedCommand extends CommandRunner {
  private logger = new Logger(SeedCommand.name);

  constructor(
    private usersSeeder: UsersSeeder,
    private citiesSeeder: CitiesSeeder,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.logger.debug('🌱 Starting database seeding...');

    try {
      // Seed users
      this.logger.debug('👥 Seeding test users...');
      await this.usersSeeder.seed();
      this.usersSeeder.getTestCredentials();

      // Seed cities
      this.logger.debug('🌍 Seeding cities...');
      await this.citiesSeeder.seed();

      this.logger.debug('✓ All seeding completed successfully! 🎉');
    } catch (error) {
      this.logger.error(`✗ Seeding failed: ${error.message}`);
      throw error;
    }
  }
}
