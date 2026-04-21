import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { minutes, ThrottlerModule } from '@nestjs/throttler';
import { SentryModule } from '@sentry/nestjs/setup';
import { AuthModule } from './modules/auth/auth.module';
import { UnhandledExceptionsFilter } from './core/filters/unhandled-exceptions.filter';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { RolesGuard } from './core/guards/roles.guard';
import { ThrottlerBehindProxyGuard } from './core/guards/throttler-behind-proxy.guard';
import { TrimStringsPipe } from './core/pipes/trim-strings.pipe';
import { MediaModule } from './modules/media/media.module';
import { DemoModule } from './modules/demo/demo.module';
import { SharedModule } from './modules/shared/shared.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CustomerModule } from './modules/customer/customer.module';
import { CountryModule } from './modules/country/country.module';
import { LoggerModule } from './core/logger/logger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SeederModule } from './modules/seeder/seeder.module';

@Global()
@Module({
  imports: [
    // -- Libraries
    LoggerModule,
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.APP_REDIS_HOST,
        port: Number.parseInt(process.env.APP_REDIS_PORT ?? '6379'),
      },
    }),
    ThrottlerModule.forRoot({
      errorMessage: 'ThrottlerException: Too Many Requests',
      throttlers: [
        {
          ttl: minutes(1),
          limit: 150,
          blockDuration: minutes(1),
        },
      ],
    }),
    CqrsModule.forRoot(),

    // -- Business Modules
    SharedModule,
    SeederModule,
    CountryModule,
    DemoModule,
    AuthModule,
    MediaModule,
    CustomerModule,
  ],
  providers: [
    // Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },

    // Filters
    {
      provide: APP_FILTER,
      useClass: UnhandledExceptionsFilter,
    },

    // Pipes
    {
      provide: APP_PIPE,
      useClass: TrimStringsPipe,
    },
  ],
  exports: [],
})
export class AppModule {}
