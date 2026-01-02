import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { VerifyTokenService } from './verify-token.service';
import { fakeVerificationToken } from 'src/test/fixtures/auth.fixtures';
import { VERIFICATION_TOKEN_REPOSITORY } from '../../domain/ports';
import type { VerificationTokenRepositoryPort } from '../../domain/ports';
import { VerificationToken } from '../../domain/entities';

describe('VerifyTokenService', () => {
  let verifyTokenService: VerifyTokenService;
  let verificationTokenRepository: DeepMockProxy<VerificationTokenRepositoryPort>;

  beforeEach(async () => {
    verificationTokenRepository = mockDeep<VerificationTokenRepositoryPort>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        VerifyTokenService,
        {
          provide: VERIFICATION_TOKEN_REPOSITORY,
          useValue: verificationTokenRepository,
        },
      ],
    }).compile();

    verifyTokenService = moduleRef.get<VerifyTokenService>(VerifyTokenService);
  });

  describe('execute', () => {
    it('should throw an error if the token is not found', async () => {
      // ===== Arrange
      verificationTokenRepository.findByTokenAndType.mockResolvedValue(null);

      // ===== Act & Assert
      await expect(
        verifyTokenService.execute({
          email: 'test@test.com',
          token: 'invalid-token',
          type: 'PASSWORD_RESET',
        }),
      ).rejects.toThrow(
        new HttpException(
          { message: 'This token is not valid or has expired.' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should return success message when token is valid', async () => {
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

      // ===== Act
      const result = await verifyTokenService.execute({
        email: 'test@test.com',
        token: '123456',
        type: 'PASSWORD_RESET',
      });

      // ===== Assert
      expect(result.message).toBe('Token is valid.');
    });
  });
});
