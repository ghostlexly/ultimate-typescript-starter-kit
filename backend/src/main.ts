import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Shared configuration (also applied by the e2e tests)
  setupApp(app);

  await app.listen(process.env.PORT ?? 3000);
}

if (cluster.isPrimary) {
  for (let i = 0; i < availableParallelism(); i++) {
    cluster.fork();
  }
  cluster.on('exit', () => cluster.fork());
} else {
  await bootstrap();
}
