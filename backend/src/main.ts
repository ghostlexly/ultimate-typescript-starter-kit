import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Use Winston as the default logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Enable shutdown hooks
  app.enableShutdownHooks();

  // Set shared settings
  app.setGlobalPrefix('api');
  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback'); // This is important for the throttler to work correctly behind a proxy
  app.set('query parser', 'extended'); // Allow nested query parameters (ex: include[]=bookings&include[]=moneyAdvance)

  // Helmet is a collection of middlewares functions that set security-related headers
  app.use(helmet());

  // Cookie parser is a middleware function that parses the cookies of the request
  app.use(cookieParser());

  // Handlebars is a template engine for Node.js
  app.useStaticAssets(join(process.cwd(), 'dist', 'public'), {
    prefix: '/public',
    setHeaders: (res: Response) => {
      // Disable CORS for Playwright
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Cross-Origin-Resource-Policy', 'cross-origin');
      res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
