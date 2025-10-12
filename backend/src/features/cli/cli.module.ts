import { Module } from '@nestjs/common';
import { BasicCommand } from './basic.command';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { ApplicationModule } from '../application/application.module';

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
  ],
  providers: [BasicCommand],
})
export class CliModule {}
