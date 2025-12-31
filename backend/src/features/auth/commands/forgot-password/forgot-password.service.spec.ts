import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ForgotPasswordService } from './forgot-password.service';
import { DatabaseService } from 'src/features/application/services/database.service';
import { fakeAccount } from 'src/test/fixtures/auth.fixtures';

describe('ForgotPasswordService', () => {
  let forgotPasswordService: ForgotPasswordService;
  let db: DeepMockProxy<DatabaseService>;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [ForgotPasswordService],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          return mockDeep(token);
        }
      })
      .compile();

    forgotPasswordService = app.get(ForgotPasswordService);
    db = app.get(DatabaseService);
  });

  describe('execute', () => {
    it('should throw an error if the account does not exist', async () => {
      // ===== Arrange
      db.prisma.account.findFirst.mockResolvedValue(null);

      // ===== Act & Assert
      await expect(
        forgotPasswordService.execute({
          email: 'nonexistent@test.com',
        }),
      ).rejects.toThrow(
        new HttpException(
          { message: 'Account not found.' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should create a password reset token and return success message', async () => {
      // ===== Arrange
      db.prisma.account.findFirst.mockResolvedValue(fakeAccount);
      db.prisma.verificationToken.create.mockResolvedValue({
        id: 'token-id',
        type: 'PASSWORD_RESET',
        token: '123456',
        value: '123456',
        accountId: fakeAccount.id,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // ===== Act
      const result = await forgotPasswordService.execute({
        email: 'test@test.com',
      });

      // ===== Assert
      expect(result.message).toBe('Password reset email sent successfully.');
      expect(db.prisma.verificationToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'PASSWORD_RESET',
            accountId: fakeAccount.id,
          }),
        }),
      );
    });
  });
});
