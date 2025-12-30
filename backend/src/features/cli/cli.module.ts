import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { ApplicationModule } from '../application/application.module';
import { AuthModule } from '../auth/auth.module';
import { CountryModule } from '../country/country.module';
import { CqrsModule } from '@nestjs/cqrs';

// Commands
import { BasicCommand } from './commands/basic.command';
import { CreateAdminAccountCommand } from './commands/create-admin-account.command';
import { GenerateJwtKeysCommand } from './commands/generate-jwt-keys.command';
import { SeedCommand } from './commands/seed.command';

// Seeders
import { UsersSeeder } from './seeders/users.seeder';
import { CitiesSeeder } from './seeders/cities.seeder';

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
    CountryModule,
  ],
  providers: [
    // Commands
    SeedCommand,
    BasicCommand,
    CreateAdminAccountCommand,
    GenerateJwtKeysCommand,

    // Seeders
    UsersSeeder,
    CitiesSeeder,
  ],
})
export class CliModule {}
