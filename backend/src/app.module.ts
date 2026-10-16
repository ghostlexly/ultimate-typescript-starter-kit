import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './modules/app/app.controller.js';
import { AppService } from './modules/app/app.service.js';
import { validateEnv } from './core/config/validate-env.js';
import { DatabaseModule } from './core/database/database.module.js';
import { AppRepository } from './modules/app/app.repository.js';

@Module({
  imports: [
    // -- Core
    ConfigModule.forRoot({
      isGlobal: true,
      // Backend-local file first, then the repository-level one shared with
      // Docker Compose. Real environment variables always take precedence.
      envFilePath: ['.env', '../.env'],
      validate: validateEnv,
    }),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppRepository],
})
export class AppModule {}
