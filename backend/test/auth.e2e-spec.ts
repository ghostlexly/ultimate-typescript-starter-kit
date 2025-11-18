/* eslint-disable @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { setupE2ETest } from './helpers/e2e-test-setup.helper';
import { TEST_USERS, getHashedPassword } from './fixtures/test-users.fixture';

describe('Authentication (e2e)', () => {
  const ctx = setupE2ETest();

  beforeEach(async () => {
    await ctx.dbHelper.reset();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid admin credentials', async () => {
      // Arrange: Create test admin
      const hashedPassword = await getHashedPassword(TEST_USERS.admin.password);

      await ctx.dbHelper.createTestAdmin({
        email: TEST_USERS.admin.email,
        password: hashedPassword,
      });

      // Act: Login
      const response = await request(ctx.httpServer)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.admin.email,
          password: TEST_USERS.admin.password,
        })
        .expect(200);

      // Assert: Check response structure
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).toBeDefined();
      expect(typeof response.body.accessToken).toBe('string');
    });

    it('should login with valid customer credentials', async () => {
      // Arrange: Create test customer
      const hashedPassword = await getHashedPassword(
        TEST_USERS.customer.password,
      );

      await ctx.dbHelper.createTestCustomer({
        email: TEST_USERS.customer.email,
        password: hashedPassword,
      });

      // Act: Login
      const response = await request(ctx.httpServer)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.customer.email,
          password: TEST_USERS.customer.password,
        })
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject login with invalid password', async () => {
      // Arrange: Create test customer
      const hashedPassword = await getHashedPassword(
        TEST_USERS.customer.password,
      );

      await ctx.dbHelper.createTestCustomer({
        email: TEST_USERS.customer.email,
        password: hashedPassword,
      });

      // Act: Login with wrong password
      const response = await request(ctx.httpServer)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.customer.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      // Assert
      expect(response.body).toHaveProperty('message');
    });

    it('should reject login with non-existent email', async () => {
      // Act: Login with email that doesn't exist
      await request(ctx.httpServer)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'SomePassword123!',
        })
        .expect(401);
    });

    it('should reject login with invalid email format', async () => {
      // Act: Login with invalid email
      await request(ctx.httpServer)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'SomePassword123!',
        })
        .expect(400);
    });

    it('should reject login with missing password', async () => {
      // Act: Login without password
      await request(ctx.httpServer)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.customer.email,
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Arrange: Create user and login to get tokens
      const hashedPassword = await getHashedPassword(
        TEST_USERS.customer.password,
      );

      await ctx.dbHelper.createTestCustomer({
        email: TEST_USERS.customer.email,
        password: hashedPassword,
      });

      const loginResponse = await request(ctx.httpServer)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.customer.email,
          password: TEST_USERS.customer.password,
        });

      const { refreshToken } = loginResponse.body;

      // Act: Refresh token
      const response = await request(ctx.httpServer)
        .post('/api/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200);

      // Assert: Should receive new tokens
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).not.toBe(
        loginResponse.body.accessToken,
      );
    });

    it('should reject refresh with invalid token', async () => {
      // Act: Try to refresh with fake token
      await request(ctx.httpServer)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    it('should allow access to protected route with valid token', async () => {
      // Arrange: Create user and get access token
      const hashedPassword = await getHashedPassword(
        TEST_USERS.customer.password,
      );

      await ctx.dbHelper.createTestCustomer({
        email: TEST_USERS.customer.email,
        password: hashedPassword,
      });

      const loginResponse = await request(ctx.httpServer)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.customer.email,
          password: TEST_USERS.customer.password,
        });

      const { accessToken } = loginResponse.body;

      // Act: Access protected route
      await request(ctx.httpServer)
        .get('/api/customer/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should reject access to protected route without token', async () => {
      // Act: Try to access protected route without token
      await request(ctx.httpServer).get('/api/customer/profile').expect(401);
    });

    it('should reject access to protected route with invalid token', async () => {
      // Act: Try to access protected route with fake token
      await request(ctx.httpServer)
        .get('/api/customer/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
