/* eslint-disable @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { setupE2ETest } from './helpers/e2e-test-setup.helper';
import { TEST_USERS } from './fixtures/test-users.fixture';

/**
 * The tests in this file are end-to-end tests for the authentication system.
 * The tests are made in 3 phases:
 * 1. Arrange: Prepare the test data when needed
 * 2. Act: Perform the action
 * 3. Assert: Check the result
 */

describe('Authentication (e2e)', () => {
  const ctx = setupE2ETest();
  let customerAccessToken: string;

  beforeEach(async () => {
    await ctx.dbHelper.reset();

    customerAccessToken = await ctx.getTokenFor('customer');
  });

  describe('POST /api/auth/signin', () => {
    it('should signin with valid admin credentials', async () => {
      // Act: Signin
      const response = await request(ctx.httpServer)
        .post('/api/auth/signin')
        .send({
          email: TEST_USERS.admin.email,
          password: TEST_USERS.admin.password,
          role: 'ADMIN',
        })
        .expect(201);

      // Assert: Check response structure
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should signin with valid customer credentials', async () => {
      // Act: Signin
      const response = await request(ctx.httpServer)
        .post('/api/auth/signin')
        .send({
          email: TEST_USERS.customer.email,
          password: TEST_USERS.customer.password,
          role: 'CUSTOMER',
        })
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject signin with invalid password', async () => {
      // Act: Signin with wrong password
      const response = await request(ctx.httpServer)
        .post('/api/auth/signin')
        .send({
          email: TEST_USERS.customer.email,
          password: 'WrongPassword123!',
          role: 'CUSTOMER',
        })
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('message');
    });

    it('should reject signin with non-existent email', async () => {
      // Act: Signin with email that doesn't exist
      await request(ctx.httpServer)
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@test.com',
          password: 'SomePassword123!',
          role: 'CUSTOMER',
        })
        .expect(400);
    });

    it('should reject signin with invalid email format', async () => {
      // Act: Signin with invalid email
      await request(ctx.httpServer)
        .post('/api/auth/signin')
        .send({
          email: 'not-an-email',
          password: 'SomePassword123!',
          role: 'CUSTOMER',
        })
        .expect(400);
    });

    it('should reject signin with missing password', async () => {
      // Act: Signin without password
      await request(ctx.httpServer)
        .post('/api/auth/signin')
        .send({
          email: TEST_USERS.customer.email,
          role: 'CUSTOMER',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Arrange: Login to get tokens
      const signinResponse = await request(ctx.httpServer).post('/api/auth/signin').send({
        email: TEST_USERS.customer.email,
        password: TEST_USERS.customer.password,
        role: 'CUSTOMER',
      });

      const { refreshToken } = signinResponse.body;

      // Act: Refresh token
      const response = await request(ctx.httpServer)
        .post('/api/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(201);

      // Assert: Should receive new tokens
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject refresh with invalid token', async () => {
      // Act: Try to refresh with fake token
      await request(ctx.httpServer)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(400);
    });
  });

  describe('Protected Routes', () => {
    it('should allow access to protected route with valid token', async () => {
      // Act: Access protected route
      const response = await request(ctx.httpServer)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(200);

      // Assert: Check response structure
      expect(response.body).toHaveProperty('accountId');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
      expect(response.body.role).toBe('CUSTOMER');
    });

    it('should reject access to protected route without token', async () => {
      // Act: Try to access protected route without token
      await request(ctx.httpServer).get('/api/auth/me').expect(401);
    });

    it('should reject access to protected route with invalid token', async () => {
      // Act: Try to access protected route with fake token
      await request(ctx.httpServer)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
