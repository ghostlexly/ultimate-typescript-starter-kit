import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';
import type { Env } from './core/config/env.types.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Shared configuration (also applied by the e2e tests)
  setupApp(app);

  const configService = app.get(ConfigService<Env, true>);
  const port = configService.get('APP_PORT', { infer: true });

  await app.listen(port);
}

if (cluster.isPrimary) {
  for (let i = 0; i < availableParallelism(); i++) {
    cluster.fork();
  }
  cluster.on('exit', () => cluster.fork());
} else {
  await bootstrap();
}
