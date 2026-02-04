import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ResetPasswordHandler } from './reset-password.handler';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { AuthService } from '../../auth.service';

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

describe('ResetPasswordHandler', () => {
  let handler: ResetPasswordHandler;
  let db: DeepMockProxy<DatabaseService>;
  let authService: DeepMockProxy<AuthService>;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [ResetPasswordHandler],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          return mockDeep(token);
        }
      })
      .compile();

    handler = app.get(ResetPasswordHandler);
    db = app.get(DatabaseService);
    authService = app.get(AuthService);
  });

  it('should successfully reset password with valid token', async () => {
    // ===== Arrange
    const fakeAccount = createMockAccount();
    authService.verifyVerificationToken.mockResolvedValue(true);
    db.prisma.account.findFirst.mockResolvedValue(fakeAccount);
    authService.hashPassword.mockResolvedValue('new-hashed-password');
    db.prisma.account.update.mockResolvedValue(fakeAccount);
    db.prisma.verificationToken.deleteMany.mockResolvedValue({ count: 1 });

    // ===== Act
    const result = await handler.execute({
      email: 'test@test.com',
      password: 'newPassword123',
      token: '123456',
    });

    // ===== Assert
    expect(result).toEqual({
      message: 'Password reset successfully.',
    });
    expect(db.prisma.account.update).toHaveBeenCalledWith({
      where: { id: fakeAccount.id },
      data: { password: 'new-hashed-password' },
    });
    expect(db.prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { accountId: fakeAccount.id, type: 'PASSWORD_RESET' },
    });
  });

  it('should throw error when token is invalid', async () => {
    // ===== Arrange
    authService.verifyVerificationToken.mockResolvedValue(false);

    // ===== Act & Assert
    await expect(
      handler.execute({
        email: 'test@test.com',
        password: 'newPassword123',
        token: 'invalid',
      }),
    ).rejects.toThrow(
      new HttpException(
        { message: 'This token is not valid or expired.' },
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  it('should throw error when account does not exist', async () => {
    // ===== Arrange
    authService.verifyVerificationToken.mockResolvedValue(true);
    db.prisma.account.findFirst.mockResolvedValue(null);

    // ===== Act & Assert
    await expect(
      handler.execute({
        email: 'unknown@test.com',
        password: 'newPassword123',
        token: '123456',
      }),
    ).rejects.toThrow(
      new HttpException({ message: 'Account not found.' }, HttpStatus.BAD_REQUEST),
    );
  });
});
