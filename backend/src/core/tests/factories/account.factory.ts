import { Account } from '../../../generated/prisma/client';

export function createMockAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 'account-123',
    email: 'test@test.com',
    role: 'CUSTOMER',
    password: 'hashed-password',
    providerId: null,
    providerAccountId: null,
    isEmailVerified: true,
    createdAt: new Date('2025-10-29T09:00:00Z'),
    updatedAt: new Date('2025-10-29T09:00:00Z'),
    ...overrides,
  };
}
