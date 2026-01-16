/**
 * Force the test database URL before any module loads.
 * This ensures E2E tests NEVER run against the production database.
 */
const TEST_DATABASE_URL =
  'postgresql://lunisoft:ChangeMe@postgres-test:5432/test';
process.env.APP_DATABASE_CONNECTION_URL = TEST_DATABASE_URL;

import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { TestDatabaseHelper } from './test-database.helper';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { TestUsersFixture, TEST_USERS } from '../fixtures/test-users.fixture';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { JwtService } from '@nestjs/jwt';
import { authConstants } from 'src/modules/auth/auth.constants';
import { TestCitiesFixture } from '../fixtures/test-cities.fixture';

export type TestUserKey = keyof typeof TEST_USERS;

export type TestModuleCustomizer = (
  builder: TestingModuleBuilder,
) => TestingModuleBuilder;

export interface E2ETestContext {
  app: INestApplication;
  httpServer: any;
  dbHelper: TestDatabaseHelper;
  db: DatabaseService;

  /**
   * Generate an access token for a test user directly (no HTTP request).
   */
  getTokenFor: (user: TestUserKey) => Promise<string>;
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
 *
 * @example With custom overrides (mocking guards, services, etc.)
 * ```typescript
 * import { JwtAuthGuard } from '../../src/core/guards/jwt-auth.guard';
 *
 * describe('Admin Feature (e2e)', () => {
 *   const ctx = setupE2ETest((builder) =>
 *     builder
 *       .overrideGuard(JwtAuthGuard)
 *       .useValue({ canActivate: () => true })
 *   );
 * });
 * ```
 */
export function setupE2ETest(customize?: TestModuleCustomizer): E2ETestContext {
  const context: E2ETestContext = {
    app: null as any,
    httpServer: null as any,
    dbHelper: null as any,
    db: null as any,
    getTokenFor: null as any,
  };

  beforeAll(async () => {
    const testingModule = await buildTestingModule(customize);

    context.dbHelper = testingModule.get(TestDatabaseHelper);
    context.db = testingModule.get(DatabaseService);
    context.getTokenFor = createTokenGenerator(context.db, testingModule);

    const app = createConfiguredApp(testingModule);

    context.app = app;
    await context.app.init();
    context.httpServer = context.app.getHttpServer();
  });

  afterAll(async () => {
    await context.app.close();
  });

  return context;
}

async function buildTestingModule(
  customize?: TestModuleCustomizer,
): Promise<TestingModule> {
  let builder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
    providers: [TestUsersFixture, TestCitiesFixture, TestDatabaseHelper],
  });

  if (customize) {
    builder = customize(builder);
  }

  return builder.compile();
}

function createConfiguredApp(
  testingModule: TestingModule,
): NestExpressApplication {
  const app = testingModule.createNestApplication<NestExpressApplication>();

  configureGlobalSettings(app);
  configureMiddlewares(app);

  return app;
}

function configureGlobalSettings(app: NestExpressApplication): void {
  app.setGlobalPrefix('api');
  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback');
  app.set('query parser', 'extended');
}

function configureMiddlewares(app: NestExpressApplication): void {
  app.use(helmet());
  app.use(cookieParser());
}

function createTokenGenerator(
  db: DatabaseService,
  testingModule: TestingModule,
): (userKey: TestUserKey) => Promise<string> {
  const jwtService = testingModule.get(JwtService);

  return async (userKey: TestUserKey) => {
    const { email } = TEST_USERS[userKey];
    const account = await db.prisma.account.findUniqueOrThrow({
      where: { email },
    });

    return jwtService.signAsync({
      payload: {
        sub: account.id,
        accountId: account.id,
        role: account.role,
        email: account.email,
      },
      options: {
        expiresIn: `${authConstants.accessTokenExpirationMinutes}m`,
      },
    });
  };
}
