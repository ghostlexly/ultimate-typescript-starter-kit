import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { VerifyCodeHandler } from './verify-code.handler';
import { VerifyCodeCommand } from './verify-code.command';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { AuthService } from '../../auth.service';
import { createMockAccount } from 'src/core/tests/factories/account.factory';
import { createMockSession } from 'src/core/tests/factories/session.factory';

describe('VerifyCodeHandler', () => {
  let handler: VerifyCodeHandler;
  let db: DeepMockProxy<DatabaseService>;
  let authService: DeepMockProxy<AuthService>;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [VerifyCodeHandler],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          return mockDeep(token);
        }
      })
      .compile();

    handler = app.get(VerifyCodeHandler);
    db = app.get(DatabaseService);
    authService = app.get(AuthService);
  });

  it('should authenticate user with valid code', async () => {
    // ===== Arrange
    const mockAccount = createMockAccount();
    const mockSession = createMockSession();

    authService.verifyLoginCode.mockResolvedValue({
      isValid: true,
      remainingAttempts: 5,
      isMaxAttemptsReached: false,
      accountId: mockAccount.id,
    });
    authService.createSession.mockResolvedValue(mockSession);
    authService.generateAuthenticationTokens.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    db.prisma.account.findUnique.mockResolvedValue(mockAccount);

    // ===== Act
    const result = await handler.execute(
      new VerifyCodeCommand({ email: 'test@test.com', code: '1234' }),
    );

    // ===== Assert
    expect(result).toEqual({
      role: mockAccount.role,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(authService.createSession).toHaveBeenCalledWith({
      accountId: mockAccount.id,
    });
  });

  it('should throw error with remaining attempts on wrong code', async () => {
    // ===== Arrange
    authService.verifyLoginCode.mockResolvedValue({
      isValid: false,
      remainingAttempts: 3,
      isMaxAttemptsReached: false,
      accountId: 'account-123',
    });

    // ===== Act & Assert
    await expect(
      handler.execute(new VerifyCodeCommand({ email: 'test@test.com', code: '9999' })),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw error when max attempts reached', async () => {
    // ===== Arrange
    authService.verifyLoginCode.mockResolvedValue({
      isValid: false,
      remainingAttempts: 0,
      isMaxAttemptsReached: true,
      accountId: 'account-123',
    });

    // ===== Act & Assert
    try {
      await handler.execute(
        new VerifyCodeCommand({ email: 'test@test.com', code: '9999' }),
      );
      fail('Should have thrown');
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toMatchObject({
        isMaxAttemptsReached: true,
      });
    }
  });
});
