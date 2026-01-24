import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ForgotPasswordHandler } from './forgot-password.handler';
import { ForgotPasswordCommand } from './forgot-password.command';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { PasswordResetRequestedEvent } from '../../events/password-reset-requested/password-reset-requested.event';

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

describe('ForgotPasswordHandler', () => {
  let handler: ForgotPasswordHandler;
  let db: DeepMockProxy<DatabaseService>;
  let eventBus: DeepMockProxy<EventBus>;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [ForgotPasswordHandler],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          return mockDeep(token);
        }
      })
      .compile();

    handler = app.get(ForgotPasswordHandler);
    db = app.get(DatabaseService);
    eventBus = app.get(EventBus);
  });

  it('should successfully create token and publish event', async () => {
    // ===== Arrange
    const fakeAccount = createMockAccount();
    db.prisma.account.findFirst.mockResolvedValue(fakeAccount);
    db.prisma.verificationToken.create.mockResolvedValue(
      createMockVerificationToken(),
    );

    // ===== Act
    const result = await handler.execute(
      new ForgotPasswordCommand({ email: 'test@test.com' }),
    );

    // ===== Assert
    expect(result).toEqual({
      message: 'Password reset email sent successfully.',
    });
    expect(db.prisma.verificationToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'PASSWORD_RESET',
        token: expect.any(String),
        accountId: fakeAccount.id,
        expiresAt: expect.any(Date),
      }),
    });
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(PasswordResetRequestedEvent),
    );
  });

  it('should throw error when account does not exist', async () => {
    // ===== Arrange
    db.prisma.account.findFirst.mockResolvedValue(null);

    // ===== Act & Assert
    await expect(
      handler.execute(new ForgotPasswordCommand({ email: 'unknown@test.com' })),
    ).rejects.toThrow(
      new HttpException(
        { message: 'Account not found.' },
        HttpStatus.BAD_REQUEST,
      ),
    );
  });
});
