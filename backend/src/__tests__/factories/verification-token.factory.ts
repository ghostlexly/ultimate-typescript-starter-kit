import { VerificationToken } from '../../generated/prisma/client';

export function createMockVerificationToken(
  overrides: Partial<VerificationToken> = {},
): VerificationToken {
  return {
    id: 'token-123',
    token: '123456',
    type: 'PASSWORD_RESET',
    accountId: 'account-123',
    value: '123456',
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
