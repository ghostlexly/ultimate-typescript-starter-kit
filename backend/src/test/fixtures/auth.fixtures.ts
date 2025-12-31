import {
  Account,
  Session,
  VerificationToken,
} from 'src/generated/prisma/client';

export const fakeAccount: Account = {
  id: 'account-123',
  email: 'test@test.com',
  role: 'CUSTOMER',
  password: 'hashed-password',
  providerId: null,
  providerAccountId: null,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const fakeSession: Session & { account: Account } = {
  id: 'session-123',
  accountId: 'account-123',
  ipAddress: '127.0.0.1',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  expiresAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  account: fakeAccount,
};

export const fakeVerificationToken: VerificationToken = {
  id: 'token-123',
  token: '123456',
  type: 'PASSWORD_RESET',
  accountId: 'account-123',
  value: '123456',
  expiresAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const fakeJwtPayload = {
  sub: fakeSession.id,
  accountId: fakeSession.accountId,
  role: fakeSession.account.role,
  email: fakeSession.account.email,
};
