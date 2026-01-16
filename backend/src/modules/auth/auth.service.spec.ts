import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DatabaseService } from '../shared/services/database.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import bcrypt from 'bcrypt';
import { JwtModule, JwtService } from '@nestjs/jwt';

function createMockAccount(overrides = {}): any {
  return {
    id: 'account-123',
    email: 'test@test.com',
    role: 'CUSTOMER',
    password: 'hashed-password',
    providerId: null,
    providerAccountId: null,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMockSession(overrides = {}): any {
  return {
    id: 'session-123',
    accountId: 'account-123',
    ipAddress: '127.0.0.1',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    account: createMockAccount(),
    ...overrides,
  };
}

function createMockVerificationToken(overrides = {}): any {
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

function createMockJwtPayload(overrides = {}): any {
  const fakeSession = createMockSession();

  return {
    payload: {
      sub: fakeSession.id,
      accountId: fakeSession.accountId,
      role: fakeSession.account.role,
      email: fakeSession.account.email,
    },
    ...overrides,
  };
}

describe('AuthService', () => {
  let db: DeepMockProxy<DatabaseService>;
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          useFactory: () => ({
            privateKey: Buffer.from(
              'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRREVDK2xTVjdsRXlkcVUKbDlVcmQ4emp3QXlFZ1BuR0NBUU1QZVFXQlVQWXhPREhsZTI5cjlIVDdoRUtPaDlIL0hMOUhrYVFZL3ZUTFRGWgpJL3BiQW4wMjVaYUNLSFFQU0xjSlpuNG4xVFdVbnJCWnM5cGxqak5CQUUyRmh6UVh5WGxGcE42SndiVkc4VGxzCmd4UmRnWSsrM0ZycXg4ZzQzbUdnVjdNQUh6Snk1MG5zTTVkSkdvZ2ZuaFpQa3JzRVNHY1RybmZEWXI1bFdEclIKVVlmYkQ0TThRSWpORHo0Z1VkYm9xYmJaenNIREV6My9NVFl5Y1hTWFFJSnBZZGwyL29wYUNjLy9NWnBpUmZVUQpOUTNMTEQ4OUlyd2RHRGRsZURsQmo4YVhybDZFemdWYnpIQzR4R3VtOFpaT3FXMklQTnBvb0taa1BuSVZWWDNSCmIzY2xRMmlkQWdNQkFBRUNnZ0VBVHJoSHRvQXlEUHlPaitjTnVqZ1BKZzVxR0ZTZnR0Um1KN0k4WVZrNDNwUmoKZTlEb2x5ZS90ZjBjaTRJK0tFNG1zQnVWa3dvS3hzZVpUcVZqTkdNaCswYWlNbDVqQi9ZWFJTZUtGWjJIdDhjbQpvY1pWdGp5c3VQZVJxVUhhZVlpMWNQRWNTSzFuQ0hiNUsyalE1eUVNb3NOaG9HK2JKcmFvOWRUeE0rWFRBSTdJCnRTK0EzdWhTMXg2TlpDM1Ayd2dWcHBPMWdmbllKTVQ0eVdISmlWdHpGYW56d1RUWG1EUkdCTzZldzJZbytVbTgKVU9JZmJJL3RYZy84Q3FtZ3c2K0tkbkdlYVpVWllJMTRETmxNdEcxdEIvVmpOVENZZU1DYnA0OEVPV25OR3VNMgptUGppNFNUb0w4SHJocHFoUHAzMkFMSUlNc0hCN0ZBUW0yQTJPS2pBWXdLQmdRRDZtNGl3clVKQzZCVXpQSE8xCmRqSDBQV0k5ZmkvVU9hbFZtUkgxbXI4OE1lem5VSmF4K2tDVzdnem9haFBxbG1DS2pjUmFFUHNvemEvN1psZEsKK0lJM0RJaWRzdTEydWo5UkxvOXo4RDdPQXAxVWFLd21TZVdLcEhBeVg4d2ZkZ2t0L3FZTFlNZTd0VkZKSExtMQpDVjdCMlk2dDFzKzNrTGJ2bm4vd2ZjOVcyd0tCZ1FESVE5Uk1XSjhuZlFkTFB2Ry9LemkxamtXd2czNkh0MXAxCnNYbHpENzhEV3g1RjNzYi9NVjRzT1ZwRHBUWDY2b28rMy9kZ0d2Tll3QXJNaUVrVWNuTHlNU3UzalROLzc0bnIKZ3VISnpFYVUweXBtNHdsSk93cnBwRzF3bzIvK2tEajhPMGxlcnp4VWlEZGJXV2JkL1h0VFJyVVVDQlIvcHcvVQprQno4QjZQcjV3S0JnUUNra3N0Ykt3eWVuNFo4bFRCdmRHVXR2Ym5zSkJnSXlLMFpWMkpoNWZPNzloVmJlcUxiCjBqbmtaQVA2Qk45N2FMR1JpN1BzYWNabWIxMG9QWGNKOXRTY2poQ1JiMVZlYU1UMzdSbXJ5NU9TK2tpVGpBR3gKUzBvQW1DaE9ESGNpR2dQQlByK1FMVWc5VHI5SXdpSjZidUxaYnFPeUthVlRLU2ZaaUQ4QWtiNDlqUUtCZ0VwQQpjL2QycUZQdzFJSityUTF2VGhCcTFzWHlpemh3c0JhUkhmR2VkZmtka0tUaFM3RVVzZEQ5MXN6YjlaNjUxVllvCm5rVEEyVmNmcFNGZXFwSHRPVmM1Q2ZkOVlBbmdXNmU1bUZQRTdLcURmT1kyNlp1QVM3U0RKWnlzekhwN0tOWEUKZVppa3FsN0JQcDBkRWJuZklSbW9UcjFGbmF3UzJoaTY4alF6OVFBakFvR0FEU3RMNTBYbVhETWU1TENtMy9Fawpab0FZZW9uNkFHVmY1c2xhNE40eWFkZ1VnakdCRDRlQjB2RjlSRG56TU5IQW5oZnFGM0lOVnVGMWFPK2pGSXlLCjdDOWJnSmNQd0xuMXFPWWRFbHFSN1pUMnlLOWR5OTVHazNxaUEwZEVRUjdIc3pxY0NKTFpqbjd0eVd4a0dBbXUKUi9hSEJ5dkR2WWxwb3BkUFpJZ2VFVVE9Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K',
              'base64',
            ).toString('utf8'),
            publicKey: Buffer.from(
              'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF4QXZwVWxlNVJNbmFsSmZWSzNmTQo0OEFNaElENXhnZ0VERDNrRmdWRDJNVGd4NVh0dmEvUjArNFJDam9mUi94eS9SNUdrR1A3MHkweFdTUDZXd0o5Ck51V1dnaWgwRDBpM0NXWitKOVUxbEo2d1diUGFaWTR6UVFCTmhZYzBGOGw1UmFUZWljRzFSdkU1YklNVVhZR1AKdnR4YTZzZklPTjVob0ZlekFCOHljdWRKN0RPWFNScUlINTRXVDVLN0JFaG5FNjUzdzJLK1pWZzYwVkdIMncrRApQRUNJelE4K0lGSFc2S20yMmM3Qnd4TTkvekUyTW5GMGwwQ0NhV0haZHY2S1dnblAvekdhWWtYMUVEVU55eXcvClBTSzhIUmczWlhnNVFZL0dsNjVlaE00Rlc4eHd1TVJycHZHV1RxbHRpRHphYUtDbVpENXlGVlY5MFc5M0pVTm8KblFJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==',
              'base64',
            ).toString('utf8'),
            signOptions: { algorithm: 'RS256' },
          }),
        }),
      ],
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          return mockDeep(token);
        }
      })
      .compile();

    db = app.get(DatabaseService);
    authService = app.get(AuthService);
    jwtService = app.get(JwtService);
  });

  describe('comparePassword', () => {
    it('should return true when password matches', async () => {
      // ===== Arrange
      const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare');
      const hashedPassword = await authService.hashPassword({
        password: 'test-password',
      });

      // ===== Act
      const result = await authService.comparePassword({
        password: 'test-password',
        hashedPassword: hashedPassword,
      });

      // ===== Assert
      expect(result).toBe(true);
      expect(bcryptCompareSpy).toHaveBeenCalledWith(
        'test-password',
        hashedPassword,
      );
    });

    it('should return false when password does not match', async () => {
      // ===== Act
      const result = await authService.comparePassword({
        password: 'wrong-password',
        hashedPassword: 'hashed-password',
      });

      // ===== Assert
      expect(result).toBe(false);
    });
  });

  describe('generateUniqueToken', () => {
    it('should generate a token of default length 32 (64 hex chars)', () => {
      const result = authService.generateUniqueToken();

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should generate a token of custom length', () => {
      const result = authService.generateUniqueToken({ length: 16 });

      expect(result.length).toBe(32); // 16 bytes = 32 hex chars
    });

    it('should generate unique tokens', () => {
      const token1 = authService.generateUniqueToken();
      const token2 = authService.generateUniqueToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('createSession', () => {
    it('should create a session with the correct account id and expiration', async () => {
      // ===== Arrange
      const fakeSession = createMockSession();
      db.prisma.session.create.mockResolvedValue(fakeSession);

      // ===== Act
      const result = await authService.createSession({
        accountId: 'account-123',
      });

      // ===== Assert
      expect(db.prisma.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          accountId: 'account-123',
          expiresAt: expect.any(Date),
        }),
      });
      expect(result).toEqual(fakeSession);
    });
  });

  describe('generateAuthenticationTokens', () => {
    it('should generate access and refresh tokens for a valid session', async () => {
      // ===== Arrange
      const fakeSession = createMockSession();
      db.prisma.session.findUnique.mockResolvedValue(fakeSession);
      const jwtSignAsyncSpy = jest.spyOn(jwtService, 'signAsync');

      // ===== Act
      const result = await authService.generateAuthenticationTokens({
        sessionId: 'session-123',
      });

      // ===== Assert
      expect(result).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      expect(jwtSignAsyncSpy).toHaveBeenCalledTimes(2);
    });

    it('should throw error when session does not exist', async () => {
      // ===== Arrange
      db.prisma.session.findUnique.mockResolvedValue(null);

      // ===== Act & Assert
      await expect(
        authService.generateAuthenticationTokens({
          sessionId: 'invalid-session',
        }),
      ).rejects.toThrow('Session does not exist.');
    });
  });

  describe('refreshAuthenticationTokens', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // ===== Arrange
      const validRefreshToken = await jwtService.signAsync({
        payload: createMockJwtPayload(),
        options: {
          expiresIn: `5m`,
        },
      });

      const fakeSession = createMockSession();
      db.prisma.session.findUnique.mockResolvedValue(fakeSession);
      db.prisma.session.update.mockResolvedValue(fakeSession);

      // ===== Act
      const result = await authService.refreshAuthenticationTokens({
        refreshToken: validRefreshToken,
      });

      // ===== Assert
      expect(db.prisma.session.update).toHaveBeenCalledWith({
        where: {
          id: fakeSession.id,
        },
        data: expect.objectContaining({
          expiresAt: expect.any(Date),
        }),
      });
      expect(result).toEqual({
        session: fakeSession,
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it('should throw error for invalid refresh token', async () => {
      // ===== Act & Assert
      await expect(
        authService.refreshAuthenticationTokens({
          refreshToken: 'invalid-token',
        }),
      ).rejects.toThrow('Invalid or expired refresh token.');
    });

    it('should throw error when token has no payload', async () => {
      // ===== Arrange
      jest.spyOn(authService, 'extractJwtPayload').mockResolvedValue({});

      // ===== Act & Assert
      await expect(
        authService.refreshAuthenticationTokens({
          refreshToken: 'token-without-payload',
        }),
      ).rejects.toThrow('This token does not provide a payload.');
    });

    it('should throw error when session does not exist', async () => {
      // ===== Arrange
      jest
        .spyOn(authService, 'extractJwtPayload')
        .mockResolvedValue(createMockJwtPayload());

      db.prisma.session.findUnique.mockResolvedValue(null);

      // ===== Act & Assert
      await expect(
        authService.refreshAuthenticationTokens({
          refreshToken: 'token-for-expired-session',
        }),
      ).rejects.toThrow('This session does not exist.');
    });
  });

  describe('verifyVerificationToken', () => {
    it('should return true when token is valid', async () => {
      // ===== Arrange
      db.prisma.verificationToken.findFirst.mockResolvedValue(
        createMockVerificationToken(),
      );

      // ===== Act
      const result = await authService.verifyVerificationToken({
        token: '123456',
        email: 'test@test.com',
        type: 'PASSWORD_RESET',
      });

      // ===== Assert
      expect(result).toBe(true);
    });

    it('should return false when token is not found', async () => {
      // ===== Arrange
      db.prisma.verificationToken.findFirst.mockResolvedValue(null);

      // ===== Act
      const result = await authService.verifyVerificationToken({
        type: 'PASSWORD_RESET',
        token: 'invalid-token',
        email: 'test@test.com',
      });

      // ===== Assert
      expect(result).toBe(false);
    });
  });
});
