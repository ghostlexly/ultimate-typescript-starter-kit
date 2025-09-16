import { Module } from '@nestjs/common';
import { BasicCommand } from './basic.command';
import { CommonModule } from 'src/common/common.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';

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

    // -- Business Modules
    CommonModule,
  ],
  providers: [BasicCommand],
})
export class CliModule {}
