import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import {
  fakeAccount,
  fakeVerificationToken,
} from 'src/test/fixtures/auth.fixtures';
import { ResetPasswordService } from './reset-password.service';
import {
  ACCOUNT_REPOSITORY,
  VERIFICATION_TOKEN_REPOSITORY,
} from '../../domain/ports';
import type {
  AccountRepositoryPort,
  VerificationTokenRepositoryPort,
} from '../../domain/ports';
import { Account, VerificationToken } from '../../domain/entities';

describe('ResetPasswordService', () => {
  let resetPasswordService: ResetPasswordService;
  let accountRepository: DeepMockProxy<AccountRepositoryPort>;
  let verificationTokenRepository: DeepMockProxy<VerificationTokenRepositoryPort>;

  beforeEach(async () => {
    accountRepository = mockDeep<AccountRepositoryPort>();
    verificationTokenRepository = mockDeep<VerificationTokenRepositoryPort>();

    const app = await Test.createTestingModule({
      providers: [
        ResetPasswordService,
        {
          provide: ACCOUNT_REPOSITORY,
          useValue: accountRepository,
        },
        {
          provide: VERIFICATION_TOKEN_REPOSITORY,
          useValue: verificationTokenRepository,
        },
      ],
    }).compile();

    resetPasswordService = app.get(ResetPasswordService);
  });

  describe('execute', () => {
    it('should throw an error if the token is invalid', async () => {
      // ===== Arrange
      verificationTokenRepository.findByTokenAndType.mockResolvedValue(null);

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
      const verificationToken = VerificationToken.fromPersistence({
        id: fakeVerificationToken.id,
        token: fakeVerificationToken.token,
        type: fakeVerificationToken.type as 'PASSWORD_RESET',
        value: fakeVerificationToken.value,
        accountId: fakeVerificationToken.accountId,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      });

      verificationTokenRepository.findByTokenAndType.mockResolvedValue(
        verificationToken,
      );
      accountRepository.findByEmail.mockResolvedValue(null);

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
      const verificationToken = VerificationToken.fromPersistence({
        id: fakeVerificationToken.id,
        token: fakeVerificationToken.token,
        type: fakeVerificationToken.type as 'PASSWORD_RESET',
        value: fakeVerificationToken.value,
        accountId: fakeVerificationToken.accountId,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      });

      const account = Account.fromPersistence({
        id: fakeAccount.id,
        email: fakeAccount.email,
        password: fakeAccount.password,
        role: fakeAccount.role as 'ADMIN' | 'CUSTOMER',
        providerId: fakeAccount.providerId,
        providerAccountId: fakeAccount.providerAccountId,
        isEmailVerified: fakeAccount.isEmailVerified,
      });

      verificationTokenRepository.findByTokenAndType.mockResolvedValue(
        verificationToken,
      );
      accountRepository.findByEmail.mockResolvedValue(account);
      accountRepository.save.mockResolvedValue();
      verificationTokenRepository.deleteByAccountIdAndType.mockResolvedValue();

      // ===== Act
      const result = await resetPasswordService.execute({
        email: 'test@test.com',
        token: '123456',
        password: 'new-password',
      });

      // ===== Assert
      expect(result.message).toBe('Password reset successfully.');
      expect(accountRepository.save).toHaveBeenCalledWith(account);
      expect(
        verificationTokenRepository.deleteByAccountIdAndType,
      ).toHaveBeenCalledWith(fakeAccount.id, 'PASSWORD_RESET');
    });
  });
});
