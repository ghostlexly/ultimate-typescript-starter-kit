import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { UsersSeeder } from '../seeders/users.seeder';

@Command({
  name: 'seed',
  description: 'Seed all data',
})
export class SeedCommandRunner extends CommandRunner {
  private logger = new Logger(SeedCommandRunner.name);

  constructor(private usersSeeder: UsersSeeder) {
    super();
  }

  async run(): Promise<void> {
    this.logger.debug('🌱 Starting database seeding...');

    try {
      // Seed users
      this.logger.debug('👥 Seeding test users...');
      await this.usersSeeder.seed();
      this.usersSeeder.getTestCredentials();

      this.logger.debug('✓ All seeding completed successfully! 🎉');
    } catch (error) {
      this.logger.error(`✗ Seeding failed: ${error.message}`);
      throw error;
    }
  }
}
