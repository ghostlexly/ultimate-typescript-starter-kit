import { VerificationToken } from '../../../generated/prisma/client';

export function createMockVerificationToken(
  overrides: Partial<VerificationToken> = {},
): VerificationToken {
  return {
    id: 'token-123',
    token: '123456',
    type: 'PASSWORD_RESET',
    accountId: 'account-123',
    value: '123456',
    attempts: 0,
    expiresAt: new Date('2025-10-29T09:30:00Z'),
    createdAt: new Date('2025-10-29T09:00:00Z'),
    updatedAt: new Date('2025-10-29T09:00:00Z'),
    ...overrides,
  };
}
