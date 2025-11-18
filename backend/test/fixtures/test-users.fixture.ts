/**
 * Test user fixtures
 * These are the test accounts that will be created for E2E tests
 */
import * as bcrypt from 'bcrypt';

export const TEST_USERS = {
  admin: {
    email: 'e2e-admin@test.com',
    password: 'TestAdmin123!',
    role: 'ADMIN' as const,
  },
  customer: {
    email: 'e2e-customer@test.com',
    password: 'TestCustomer123!',
    role: 'CUSTOMER' as const,
  },
  customer2: {
    email: 'e2e-customer2@test.com',
    password: 'TestCustomer123!',
    role: 'CUSTOMER' as const,
  },
} as const;

/**
 * Get hashed version of test passwords
 * Use this when creating users directly in the database
 */
export async function getHashedPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
