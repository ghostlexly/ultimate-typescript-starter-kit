import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { DatabaseService } from 'src/features/application/services/database.service';
import {
  fakeAccount,
  fakeVerificationToken,
} from 'src/test/fixtures/auth.fixtures';
import { ResetPasswordService } from './reset-password.service';

describe('ResetPasswordService', () => {
  let resetPasswordService: ResetPasswordService;
  let db: DeepMockProxy<DatabaseService>;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [ResetPasswordService],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          return mockDeep(token);
        }
      })
      .compile();

    resetPasswordService = app.get(ResetPasswordService);
    db = app.get(DatabaseService);
  });

  describe('execute', () => {
    it('should throw an error if the token is invalid', async () => {
      // ===== Arrange
      db.prisma.verificationToken.findFirst.mockResolvedValue(null);

      // ===== Act & Assert
      await expect(
        resetPasswordService.execute({
          email: 'test@test.com',
          token: 'invalid-token',
          password: 'new-password',
        }),
      ).rejects.toThrow(
        new HttpException(
          { message: 'This token is not valid or expired.' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if the account does not exist', async () => {
      // ===== Arrange
      db.prisma.verificationToken.findFirst.mockResolvedValue(
        fakeVerificationToken,
      );
      db.prisma.account.findFirst.mockResolvedValue(null);

      // ===== Act & Assert
      await expect(
        resetPasswordService.execute({
          email: 'test@test.com',
          token: '123456',
          password: 'new-password',
        }),
      ).rejects.toThrow(
        new HttpException(
          { message: 'Account not found.' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should reset password successfully', async () => {
      // ===== Arrange
      db.prisma.verificationToken.findFirst.mockResolvedValue(
        fakeVerificationToken,
      );
      db.prisma.account.findFirst.mockResolvedValue(fakeAccount);
      db.prisma.account.update.mockResolvedValue(fakeAccount);

      // ===== Act
      const result = await resetPasswordService.execute({
        email: 'test@test.com',
        token: '123456',
        password: 'new-password',
      });

      // ===== Assert
      expect(result.message).toBe('Password reset successfully.');
      expect(db.prisma.account.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: fakeAccount.id },
          data: expect.objectContaining({
            password: expect.any(String),
          }),
        }),
      );
      expect(db.prisma.verificationToken.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            accountId: fakeAccount.id,
            type: 'PASSWORD_RESET',
          },
        }),
      );
    });
  });
});
