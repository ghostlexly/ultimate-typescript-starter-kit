import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { TestDatabaseHelper } from './test-database.helper';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

export interface E2ETestContext {
  app: INestApplication;
  httpServer: any;
  dbHelper: TestDatabaseHelper;
}

/**
 * Setup helper for E2E tests
 * Handles app initialization, database connection, and cleanup
 *
 * @example
 * ```typescript
 * describe('My Feature (e2e)', () => {
 *   const ctx = setupE2ETest();
 *
 *   beforeEach(async () => {
 *     await ctx.dbHelper.reset();
 *   });
 *
 *   it('should work', async () => {
 *     await request(ctx.httpServer).get('/api/endpoint').expect(200);
 *   });
 * });
 * ```
 */
export function setupE2ETest(): E2ETestContext {
  const context: E2ETestContext = {
    app: null as any,
    httpServer: null as any,
    dbHelper: null as any,
  };

  beforeAll(async () => {
    // Initialize database helper
    context.dbHelper = new TestDatabaseHelper();
    await context.dbHelper.connect();

    // Create testing module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Create and configure app (same as production, check main.ts file)
    const app = moduleFixture.createNestApplication<NestExpressApplication>();

    // Apply global prefix
    app.setGlobalPrefix('api');

    // Set application settings
    app.setGlobalPrefix('api');
    app.disable('x-powered-by');
    app.set('trust proxy', 'loopback'); // This is important for the throttler to work correctly behind a proxy
    app.set('query parser', 'extended'); // Allow nested query parameters (ex: include[]=bookings&include[]=moneyAdvance)

    // Helmet is a collection of middlewares functions that set security-related headers
    app.use(helmet());

    // Cookie parser is a middleware function that parses the cookies of the request
    app.use(cookieParser());

    context.app = app;

    await context.app.init();

    // Store HTTP server
    context.httpServer = context.app.getHttpServer();
  });

  afterAll(async () => {
    // Cleanup
    await context.dbHelper.cleanDatabase();
    await context.dbHelper.disconnect();
    await context.app.close();
  });

  return context;
}
