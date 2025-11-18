import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { TestDatabaseHelper } from './test-database.helper';

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

    // Create and configure app
    context.app = moduleFixture.createNestApplication();

    // Apply global pipes (same as production)
    context.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

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
