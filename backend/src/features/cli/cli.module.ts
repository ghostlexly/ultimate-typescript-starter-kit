import { Module } from '@nestjs/common';
import { BasicCommand } from './basic.command';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { ApplicationModule } from '../application/application.module';
import { CreateAdminAccountCommand } from './create-admin-account.command';
import { AuthModule } from '../auth/auth.module';

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

    ApplicationModule,
    AuthModule,
  ],
  providers: [BasicCommand, CreateAdminAccountCommand],
})
export class CliModule {}
