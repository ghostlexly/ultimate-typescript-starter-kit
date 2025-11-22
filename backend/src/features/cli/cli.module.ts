import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { ApplicationModule } from '../application/application.module';
import { AuthModule } from '../auth/auth.module';
import { CqrsModule } from '@nestjs/cqrs';

// Commands
import { BasicCommand } from './commands/basic.command';
import { CreateAdminAccountCommand } from './commands/create-admin-account.command';
import { GenerateJwtKeysCommand } from './commands/generate-jwt-keys.command';
import { SeedCommand } from './commands/seed.command';

// Seeders
import { CountriesSeeder } from './seeders/countries.seeder';
import { UsersSeeder } from './seeders/users.seeder';
import { FakeDataSeeder } from './seeders/fake-data.seeder';

@Module({
  imports: [
    // -- Libraries
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.APP_REDIS_HOST,
        port: parseInt(process.env.APP_REDIS_PORT ?? '6379'),
      },
    }),
    CqrsModule.forRoot(),

    ApplicationModule,
    AuthModule,
  ],
  providers: [
    // Commands
    SeedCommand,
    BasicCommand,
    CreateAdminAccountCommand,
    GenerateJwtKeysCommand,

    // Seeders
    CountriesSeeder,
    UsersSeeder,
    FakeDataSeeder,
  ],
})
export class CliModule {}
