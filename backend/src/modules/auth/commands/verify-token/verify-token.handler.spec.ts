import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { VerifyTokenHandler } from './verify-token.handler';
import { VerifyTokenCommand } from './verify-token.command';
import { AuthService } from '../../auth.service';

describe('VerifyTokenHandler', () => {
  let handler: VerifyTokenHandler;
  let authService: DeepMockProxy<AuthService>;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [VerifyTokenHandler],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          return mockDeep(token);
        }
      })
      .compile();

    handler = app.get(VerifyTokenHandler);
    authService = app.get(AuthService);
  });

  it('should return success when token is valid', async () => {
    // ===== Arrange
    authService.verifyVerificationToken.mockResolvedValue(true);

    // ===== Act
    const result = await handler.execute(
      new VerifyTokenCommand({
        data: {
          type: 'PASSWORD_RESET',
          token: '123456',
          email: 'test@test.com',
        },
      }),
    );

    // ===== Assert
    expect(result).toEqual({
      message: 'Token is valid.',
    });
     
    expect(authService.verifyVerificationToken).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PASSWORD_RESET',
        token: '123456',
        email: 'test@test.com',
      }),
    );
  });

  it('should throw error when token is invalid or expired', async () => {
    // ===== Arrange
    authService.verifyVerificationToken.mockResolvedValue(false);

    // ===== Act & Assert
    await expect(
      handler.execute(
        new VerifyTokenCommand({
          data: {
            type: 'PASSWORD_RESET',
            token: 'invalid',
            email: 'test@test.com',
          },
        }),
      ),
    ).rejects.toThrow(
      new HttpException(
        { message: 'This token is not valid or has expired.' },
        HttpStatus.BAD_REQUEST,
      ),
    );
  });
});
