import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { ForgotPasswordHandler } from './forgot-password.handler';
import { ForgotPasswordCommand } from './forgot-password.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import {
  fakeAccount,
  fakeVerificationToken,
} from 'src/test/fixtures/auth.fixtures';

describe('ForgotPasswordHandler', () => {
  let handler: ForgotPasswordHandler;
  let db: DeepMockProxy<DatabaseService>;

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
  });

  it('should successfully send password reset email', async () => {
    // ===== Arrange
    db.prisma.account.findFirst.mockResolvedValue(fakeAccount);
    db.prisma.verificationToken.create.mockResolvedValue(fakeVerificationToken);

    // ===== Act
    const result = await handler.execute(
      new ForgotPasswordCommand({ data: { email: 'test@test.com' } }),
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
  });

  it('should throw error when account does not exist', async () => {
    // ===== Arrange
    db.prisma.account.findFirst.mockResolvedValue(null);

    // ===== Act & Assert
    await expect(
      handler.execute(
        new ForgotPasswordCommand({ data: { email: 'unknown@test.com' } }),
      ),
    ).rejects.toThrow(
      new HttpException(
        { message: 'Account not found.' },
        HttpStatus.BAD_REQUEST,
      ),
    );
  });
});
