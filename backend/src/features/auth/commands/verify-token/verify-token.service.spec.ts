import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { VerifyTokenService } from './verify-token.service';
import { DatabaseService } from 'src/features/application/services/database.service';
import { fakeVerificationToken } from 'src/test/fixtures/auth.fixtures';

describe('VerifyTokenService', () => {
  let verifyTokenService: VerifyTokenService;
  let db: DeepMockProxy<DatabaseService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [VerifyTokenService],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          return mockDeep(token);
        }
      })
      .compile();

    verifyTokenService = moduleRef.get<VerifyTokenService>(VerifyTokenService);
    db = moduleRef.get(DatabaseService);
  });

  describe('execute', () => {
    it('should throw an error if the token is not found', async () => {
      // ===== Arrange
      db.prisma.verificationToken.findFirst.mockResolvedValue(null);

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
      db.prisma.verificationToken.findFirst.mockResolvedValue(
        fakeVerificationToken,
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
