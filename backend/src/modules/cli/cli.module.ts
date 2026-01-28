import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { CountryModule } from '../country/country.module';
import { CqrsModule } from '@nestjs/cqrs';
import { BasicCommandRunner } from './commands/basic.command';
import { CreateAdminAccountCommandRunner } from './commands/create-admin-account.command';
import { GenerateJwtKeysCommandRunner } from './commands/generate-jwt-keys.command';
import { SeedCommandRunner } from './commands/seed.command';
import { UsersSeeder } from './seeders/users.seeder';

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

    SharedModule,
    AuthModule,
    CountryModule,
  ],
  providers: [
    // Commands
    SeedCommandRunner,
    BasicCommandRunner,
    CreateAdminAccountCommandRunner,
    GenerateJwtKeysCommandRunner,

    // Seeders
    UsersSeeder,
  ],
})
export class CliModule {}
