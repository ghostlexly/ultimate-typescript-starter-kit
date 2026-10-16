import { NestExpressApplication } from '@nestjs/platform-express';

/**
 * Applies the application-level configuration shared by every entry point
 * (production bootstrap, e2e tests, ...).
 *
 * Keep process management (clustering, listening) out of here: this function
 * must only configure an already created Nest application instance.
 */
export function setupApp(app: NestExpressApplication): void {
  // Enable shutdown hooks
  app.enableShutdownHooks();

  // Set shared settings
  app.setGlobalPrefix('api');
  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback'); // This is important for the throttler to work correctly behind a proxy
  app.set('query parser', 'extended'); // Allow nested query parameters (ex: include[]=bookings&include[]=moneyAdvance)
}
