import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ForgotPasswordService } from './forgot-password.service';
import { fakeAccount } from 'src/test/fixtures/auth.fixtures';
import {
  ACCOUNT_REPOSITORY,
  VERIFICATION_TOKEN_REPOSITORY,
} from '../../domain/ports';
import type {
  AccountRepositoryPort,
  VerificationTokenRepositoryPort,
} from '../../domain/ports';
import { Account } from '../../domain/entities';

describe('ForgotPasswordService', () => {
  let forgotPasswordService: ForgotPasswordService;
  let accountRepository: DeepMockProxy<AccountRepositoryPort>;
  let verificationTokenRepository: DeepMockProxy<VerificationTokenRepositoryPort>;

  beforeEach(async () => {
    accountRepository = mockDeep<AccountRepositoryPort>();
    verificationTokenRepository = mockDeep<VerificationTokenRepositoryPort>();

    const app = await Test.createTestingModule({
      providers: [
        ForgotPasswordService,
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

    forgotPasswordService = app.get(ForgotPasswordService);
  });

  describe('execute', () => {
    it('should throw an error if the account does not exist', async () => {
      // ===== Arrange
      accountRepository.findByEmail.mockResolvedValue(null);

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
      const account = Account.fromPersistence({
        id: fakeAccount.id,
        email: fakeAccount.email,
        password: fakeAccount.password,
        role: fakeAccount.role as 'ADMIN' | 'CUSTOMER',
        providerId: fakeAccount.providerId,
        providerAccountId: fakeAccount.providerAccountId,
        isEmailVerified: fakeAccount.isEmailVerified,
      });

      accountRepository.findByEmail.mockResolvedValue(account);
      accountRepository.save.mockResolvedValue();
      verificationTokenRepository.save.mockResolvedValue();

      // ===== Act
      const result = await forgotPasswordService.execute({
        email: 'test@test.com',
      });

      // ===== Assert
      expect(result.message).toBe('Password reset email sent successfully.');
      expect(verificationTokenRepository.save).toHaveBeenCalled();
      expect(accountRepository.save).toHaveBeenCalledWith(account);
    });
  });
});
