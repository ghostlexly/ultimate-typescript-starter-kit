# Testing Guide

This guide covers testing strategies, best practices, and patterns for this NestJS + Prisma application.

## Table of Contents

- [E2E vs Unit Tests](#e2e-vs-unit-tests)
- [Database Management in Tests](#database-management-in-tests)
- [Running Tests](#running-tests)
- [Writing E2E Tests](#writing-e2e-tests)
- [Writing Unit Tests](#writing-unit-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## E2E vs Unit Tests

### If You Can Only Choose One: E2E Tests

**Why E2E tests are prioritized for APIs:**

✅ **Pros:**

- Test real user behavior (HTTP → Database → Response)
- Catch integration bugs (auth guards, pipes, database queries)
- More confidence in production behavior
- Less brittle (survive refactoring)
- Better ROI (one test covers multiple units)

❌ **Cons:**

- Slower execution
- Harder to debug
- Require database setup

### Unit Tests: When to Use

Use unit tests for:

- **Complex business logic** (calculations, algorithms)
- **Utility functions** (formatters, validators)
- **Services with branching logic** (multiple if/else paths)
- **Pure functions** (no side effects)

Example: Testing a price calculation function:

```typescript
describe('calculateDiscount', () => {
  it('should apply 10% discount for orders over $100', () => {
    expect(calculateDiscount(150, 'SUMMER10')).toBe(135);
  });
});
```

### Recommended Testing Pyramid

```
        /\
       /  \    10% - E2E (Critical user flows)
      /____\
     /      \  30% - Integration (Service + DB)
    /________\
   /          \ 60% - Unit (Business logic)
  /____________\
```

**But for this project, start with E2E for API endpoints, then add unit tests for complex logic.**

## Database Management in Tests

### Strategy: Clean → Seed → Test → Clean

```
┌─────────────────────────────────┐
│ beforeAll()                     │
│ - Connect to test database      │
│ - Initialize app                │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│ beforeEach()                    │
│ - Clean all tables              │
│ - Seed minimal test data        │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│ test() - Run actual test        │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│ afterAll()                      │
│ - Clean database                │
│ - Disconnect                    │
│ - Close app                     │
└─────────────────────────────────┘
```

### Test Database Setup

1. **Create a separate test database:**

```bash
# .env.test
APP_DATABASE_CONNECTION_URL="postgresql://user:password@localhost:5432/myapp_test"
```

2. **Run migrations on test database:**

```bash
NODE_ENV=test npx prisma migrate deploy
```

3. **Never use production database for tests!**

### Using the E2E Test Setup Helper

**The `setupE2ETest()` helper automatically handles:**

- ✅ Database connection and cleanup
- ✅ App initialization with global pipes
- ✅ HTTP server setup
- ✅ Proper teardown after tests

```typescript
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { setupE2ETest } from './helpers/e2e-test-setup.helper';

describe('My Feature (e2e)', () => {
  const { httpServer, dbHelper } = setupE2ETest();

  beforeEach(async () => {
    await dbHelper.reset(); // Clean + seed minimal data
  });

  it('should work', async () => {
    // Test uses clean database state
    await request(httpServer).get('/api/endpoint').expect(200);
  });
});
```

**What happened to all the boilerplate?** The `setupE2ETest()` helper takes care of it! 🎉

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests only
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Run specific test file
npm test -- auth.e2e-spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should login"
```

### In Docker

Note : Run this command in the project's root directory.

```bash
make test
```

## Writing E2E Tests

### Quick Start: Simplified E2E Test Pattern

```typescript
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { setupE2ETest } from './helpers/e2e-test-setup.helper';

describe('My Feature (e2e)', () => {
  const { httpServer, dbHelper } = setupE2ETest();

  beforeEach(async () => {
    await dbHelper.reset();
  });

  it('should work', async () => {
    await request(httpServer).get('/api/endpoint').expect(200);
  });
});
```

### Complete E2E Test Example

```typescript
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { setupE2ETest } from './helpers/e2e-test-setup.helper';
import { getHashedPassword } from './fixtures/test-users.fixture';

describe('Customers (e2e)', () => {
  const { httpServer, dbHelper } = setupE2ETest();

  let customerToken: string;

  beforeEach(async () => {
    await dbHelper.reset();

    // Login to get auth token
    const hashedPassword = await getHashedPassword('TestPass123!');
    await dbHelper.createTestCustomer({
      email: 'test@example.com',
      password: hashedPassword,
    });

    const response = await request(httpServer).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'TestPass123!',
    });

    customerToken = response.body.accessToken;
  });

  describe('GET /api/customer/profile', () => {
    it('should return customer profile', async () => {
      const response = await request(httpServer)
        .get('/api/customer/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe('test@example.com');
    });

    it('should return 401 without token', async () => {
      await request(httpServer).get('/api/customer/profile').expect(401);
    });
  });

  describe('PUT /api/customer/profile', () => {
    it('should update customer email', async () => {
      const response = await request(httpServer)
        .put('/api/customer/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          email: 'newemail@example.com',
        })
        .expect(200);

      expect(response.body.email).toBe('newemail@example.com');

      // Verify in database
      const customer = await dbHelper.getPrisma().customer.findUnique({
        where: { email: 'newemail@example.com' },
      });
      expect(customer).toBeDefined();
    });

    it('should reject invalid email format', async () => {
      await request(httpServer)
        .put('/api/customer/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          email: 'not-an-email',
        })
        .expect(400);
    });
  });
});
```

### E2E Testing Patterns

#### 1. **AAA Pattern (Arrange, Act, Assert)**

```typescript
it('should create a customer', async () => {
  // Arrange: Setup test data
  const customerData = {
    email: 'new@example.com',
    password: 'Password123!',
  };

  // Act: Perform the action
  const response = await request(httpServer)
    .post('/api/customers')
    .send(customerData)
    .expect(201);

  // Assert: Verify the result
  expect(response.body).toHaveProperty('id');
  expect(response.body.email).toBe(customerData.email);

  // Verify in database
  const customer = await dbHelper.getPrisma().customer.findUnique({
    where: { email: customerData.email },
  });
  expect(customer).toBeDefined();
});
```

**Note:** `httpServer` and `dbHelper` come from `setupE2ETest()`

#### 2. **Test Authentication**

```typescript
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { setupE2ETest } from './helpers/e2e-test-setup.helper';
import { getHashedPassword } from './fixtures/test-users.fixture';

describe('Protected endpoints', () => {
  const { httpServer, dbHelper } = setupE2ETest();

  let adminToken: string;
  let customerToken: string;

  beforeEach(async () => {
    await dbHelper.reset();

    // Create and login as admin
    const hashedPassword = await getHashedPassword('Admin123!');
    await dbHelper.createTestAdmin({
      email: 'admin@test.com',
      password: hashedPassword,
    });

    const adminLogin = await request(httpServer)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin123!' });

    adminToken = adminLogin.body.accessToken;

    // Create and login as customer
    await dbHelper.createTestCustomer({
      email: 'customer@test.com',
      password: hashedPassword,
    });

    const customerLogin = await request(httpServer)
      .post('/api/auth/login')
      .send({ email: 'customer@test.com', password: 'Admin123!' });

    customerToken = customerLogin.body.accessToken;
  });

  it('should allow admin to access admin routes', async () => {
    await request(httpServer)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('should prevent customer from accessing admin routes', async () => {
    await request(httpServer)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });
});
```

#### 3. **Test Validation**

```typescript
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { setupE2ETest } from './helpers/e2e-test-setup.helper';

describe('POST /api/customers - Validation', () => {
  const { httpServer, dbHelper } = setupE2ETest();

  beforeEach(async () => {
    await dbHelper.reset();
  });

  it('should reject missing email', async () => {
    await request(httpServer)
      .post('/api/customers')
      .send({
        password: 'Password123!',
      })
      .expect(400);
  });

  it('should reject invalid email format', async () => {
    const response = await request(httpServer)
      .post('/api/customers')
      .send({
        email: 'not-an-email',
        password: 'Password123!',
      })
      .expect(400);

    expect(response.body.message).toContain('email');
  });

  it('should reject weak password', async () => {
    await request(httpServer)
      .post('/api/customers')
      .send({
        email: 'test@example.com',
        password: '123',
      })
      .expect(400);
  });
});
```

## Writing Unit Tests

### Service Unit Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { DatabaseService } from '../shared/services/database.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let mockDbService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    // Create mock database service
    mockDbService = {
      prisma: {
        customer: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return customer when found', async () => {
      const mockCustomer = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed',
      };

      mockDbService.prisma.customer.findUnique.mockResolvedValue(mockCustomer);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockCustomer);
      expect(mockDbService.prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when not found', async () => {
      mockDbService.prisma.customer.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});
```

## Best Practices

### ✅ Do's

1. **Isolate tests** - Each test should be independent
2. **Use descriptive test names** - `it('should reject login with invalid password')`
3. **Test one thing per test** - Single assertion or related assertions
4. **Clean database between tests** - Use `beforeEach` to reset state
5. **Use fixtures** - Reusable test data
6. **Test error cases** - Not just happy paths
7. **Verify database state** - Don't trust API responses alone
8. **Use realistic data** - Test with production-like data

### ❌ Don'ts

1. **Don't test implementation details** - Test behavior, not internals
2. **Don't share state between tests** - Each test should be independent
3. **Don't use production database** - Always use a separate test database
4. **Don't skip cleanup** - Always clean up after tests
5. **Don't test third-party code** - Trust external libraries work
6. **Don't make tests too complex** - Keep tests simple and readable
7. **Don't use real external services** - Mock APIs, email services, etc.

### Test Structure

```typescript
describe('Feature Name', () => {
  // Setup
  beforeAll(() => {
    // One-time setup (app initialization)
  });

  afterAll(() => {
    // One-time teardown (close connections)
  });

  beforeEach(() => {
    // Reset state before each test
  });

  describe('Specific Scenario', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should handle error case', () => {
      // Test error handling
    });
  });
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: myapp_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          APP_DATABASE_CONNECTION_URL: postgresql://postgres:postgres@localhost:5432/myapp_test

      - name: Run tests
        run: npm run test:e2e
        env:
          APP_DATABASE_CONNECTION_URL: postgresql://postgres:postgres@localhost:5432/myapp_test
```

## Quick Reference

### Test a Protected Endpoint

```typescript
// Inside your test file with setupE2ETest()
const { httpServer, dbHelper } = setupE2ETest();

// 1. Create user
const hashedPassword = await getHashedPassword('Pass123!');
await dbHelper.createTestCustomer({
  email: 'test@example.com',
  password: hashedPassword,
});

// 2. Login
const loginResponse = await request(httpServer)
  .post('/api/auth/login')
  .send({ email: 'test@example.com', password: 'Pass123!' });

const token = loginResponse.body.accessToken;

// 3. Make authenticated request
await request(httpServer)
  .get('/api/protected-route')
  .set('Authorization', `Bearer ${token}`)
  .expect(200);
```

### Test Pagination

```typescript
it('should paginate results', async () => {
  // Create 25 test records
  for (let i = 0; i < 25; i++) {
    await dbHelper.getPrisma().customer.create({
      data: {
        email: `customer${i}@test.com`,
        password: 'hashed',
        account: { create: { role: 'CUSTOMER' } },
      },
    });
  }

  // Get first page
  const page1 = await request(httpServer)
    .get('/api/customers?page=1&limit=10')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);

  expect(page1.body.data).toHaveLength(10);
  expect(page1.body.total).toBe(25);
  expect(page1.body.page).toBe(1);
});
```

### Test File Upload

```typescript
it('should upload file', async () => {
  const response = await request(httpServer)
    .post('/api/upload')
    .set('Authorization', `Bearer ${token}`)
    .attach('file', Buffer.from('test content'), 'test.txt')
    .expect(201);

  expect(response.body).toHaveProperty('url');
});
```

## Summary

### 🎯 Always Use `setupE2ETest()` Helper

**Every E2E test file should start with:**

```typescript
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { setupE2ETest } from './helpers/e2e-test-setup.helper';

describe('My Feature (e2e)', () => {
  const { httpServer, dbHelper } = setupE2ETest();

  beforeEach(async () => {
    await dbHelper.reset();
  });

  // Your tests here
});
```

This eliminates 90% of boilerplate code!

### Testing Priorities

**Start with E2E tests** for your main API endpoints:

- Authentication flow
- CRUD operations
- Protected routes
- Error handling

**Add unit tests** for complex business logic:

- Calculations
- Validations
- Utilities

### Database Strategy

- ✅ Use `setupE2ETest()` for automatic setup/cleanup
- ✅ Call `dbHelper.reset()` in `beforeEach` for clean state
- ✅ Seed only minimal data needed for tests
- ✅ Use fixtures from `test/fixtures/` for test data
- ✅ Always use a separate test database (never production!)

**Golden rule:** If it can break in production, test it.
