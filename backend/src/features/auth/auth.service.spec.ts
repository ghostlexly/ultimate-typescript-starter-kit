import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ModuleMocker, MockMetadata } from 'jest-mock';
import { DatabaseService } from '../application/services/database.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const moduleMocker = new ModuleMocker(globalThis);

describe('AuthService', () => {
  let authService: AuthService;

  // Database mocks
  const mockSessionCreate = jest.fn();
  const mockSessionFindUnique = jest.fn();
  const mockSessionUpdate = jest.fn();
  const mockVerificationTokenFindFirst = jest.fn();

  // JWT mocks
  const mockJwtSignAsync = jest.fn();

  const fakeSession = {
    id: 'session-123',
    accountId: 'account-123',
    ipAddress: '127.0.0.1',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    account: {
      id: 'account-123',
      email: 'test@test.com',
      role: 'CUSTOMER' as const,
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const fakeJwtPayload = {
    payload: { sub: 'session-123', accountId: 'account-123' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === DatabaseService) {
          return {
            prisma: {
              session: {
                create: mockSessionCreate,
                findUnique: mockSessionFindUnique,
                update: mockSessionUpdate,
              },
              verificationToken: {
                findFirst: mockVerificationTokenFindFirst,
              },
            },
          };
        }

        if (token === JwtService) {
          return {
            signAsync: mockJwtSignAsync,
          };
        }

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockMetadata<
            any,
            any
          >;
          const Mock = moduleMocker.generateFromMetadata(
            mockMetadata,
          ) as ObjectConstructor;

          return new Mock();
        }
      })
      .compile();

    authService = moduleRef.get(AuthService);
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
      mockSessionCreate.mockResolvedValue(fakeSession);

      // ===== Act
      const result = await authService.createSession({
        accountId: 'account-123',
      });

      // ===== Assert
      expect(mockSessionCreate).toHaveBeenCalledWith({
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
      mockSessionFindUnique.mockResolvedValue(fakeSession);
      mockJwtSignAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      // ===== Act
      const result = await authService.generateAuthenticationTokens({
        sessionId: 'session-123',
      });

      // ===== Assert
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(mockJwtSignAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw error when session does not exist', async () => {
      // ===== Arrange
      mockSessionFindUnique.mockResolvedValue(null);

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
      jest
        .spyOn(authService, 'extractJwtPayload')
        .mockResolvedValue(fakeJwtPayload);

      mockSessionFindUnique.mockResolvedValue(fakeSession);
      mockSessionUpdate.mockResolvedValue(fakeSession);

      mockJwtSignAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      // ===== Act
      const result = await authService.refreshAuthenticationTokens({
        refreshToken: 'valid-refresh-token',
      });

      // ===== Assert
      expect(mockSessionUpdate).toHaveBeenCalledWith({
        where: {
          id: 'session-123',
        },
        data: expect.objectContaining({
          expiresAt: expect.any(Date),
        }),
      });
      expect(result).toEqual({
        session: fakeSession,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw error for invalid refresh token', async () => {
      // ===== Arrange
      jest
        .spyOn(authService, 'extractJwtPayload')
        .mockRejectedValue(new Error('Invalid token'));

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
        .mockResolvedValue(fakeJwtPayload);

      mockSessionFindUnique.mockResolvedValue(null);

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
      mockVerificationTokenFindFirst.mockResolvedValue({
        id: 'token-123',
        token: '123456',
        type: 'PASSWORD_RESET',
      });

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
      mockVerificationTokenFindFirst.mockResolvedValue(null);

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
