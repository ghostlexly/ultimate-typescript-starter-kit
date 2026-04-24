import { Session } from '../../../generated/prisma/client';

export function createMockSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'session-123',
    accountId: 'account-123',
    ipAddress: '127.0.0.1',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    expiresAt: new Date('2025-10-29T09:30:00Z'),
    createdAt: new Date('2025-10-29T09:00:00Z'),
    updatedAt: new Date('2025-10-29T09:00:00Z'),
    ...overrides,
  };
}
