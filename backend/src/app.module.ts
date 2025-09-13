import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { CommonModule } from './common/common.module';
import { UnhandledExceptionsFilter } from './common/filters/unhandled-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { TrimStringsPipe } from './common/pipes/trim-strings.pipe';
import { MediaModule } from './features/media/media.module';
import { DemoModule } from './features/demo/demo.module';

@Global()
@Module({
  imports: [
    // -- Libraries
    SentryModule.forRoot(),
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
    ThrottlerModule.forRoot({
      errorMessage: 'ThrottlerException: Too Many Requests',
      throttlers: [
        {
          name: 'long',
          ttl: 1 * 60 * 1000, // 1 minute
          limit: 500,
          blockDuration: 1 * 60 * 1000, // 1 minute
        },
      ],
    }),

    // -- Business Modules
    CommonModule,
    DemoModule,
    AuthModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

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
