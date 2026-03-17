import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
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

  it('should return true when token is valid', async () => {
    // ===== Arrange
    authService.verifyVerificationToken.mockResolvedValue(true);

    // ===== Act
    const result = await handler.execute(
      new VerifyTokenCommand({
        type: 'PASSWORD_RESET',
        token: '123456',
        email: 'test@test.com',
      }),
    );

    // ===== Assert
    expect(result).toEqual(true);

    expect(authService.verifyVerificationToken).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PASSWORD_RESET',
        token: '123456',
        email: 'test@test.com',
      }),
    );
  });

  it('should return false when token is invalid or expired', async () => {
    // ===== Arrange
    authService.verifyVerificationToken.mockResolvedValue(false);

    // ===== Act
    const result = await handler.execute(
      new VerifyTokenCommand({
        type: 'PASSWORD_RESET',
        token: '123456',
        email: 'test@test.com',
      }),
    );

    // ===== Assert
    expect(result).toEqual(false);
  });
});
