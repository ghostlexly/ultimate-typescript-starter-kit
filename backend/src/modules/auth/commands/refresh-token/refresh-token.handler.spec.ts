import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { RefreshTokenHandler } from './refresh-token.handler';
import { AuthService } from '../../auth.service';
import { createMockSession } from 'src/__tests__/factories/session.factory';
import { createMockAccount } from 'src/__tests__/factories/account.factory';

describe('RefreshTokenHandler', () => {
  let handler: RefreshTokenHandler;
  let authService: DeepMockProxy<AuthService>;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [RefreshTokenHandler],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          return mockDeep(token);
        }
      })
      .compile();

    handler = app.get(RefreshTokenHandler);
    authService = app.get(AuthService);
  });

  it('should successfully refresh tokens with valid refresh token', async () => {
    // ===== Arrange
    authService.refreshAuthenticationTokens.mockResolvedValue({
      session: { ...createMockSession(), account: createMockAccount() },
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    // ===== Act
    const result = await handler.execute({
      refreshToken: 'valid-refresh-token',
    });

    // ===== Assert
    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });

  it('should throw error when refresh token is not provided', async () => {
    // ===== Act & Assert
    await expect(
      handler.execute({
        refreshToken: '',
      }),
    ).rejects.toThrow(
      new HttpException(
        {
          message:
            'Refresh token not found. Please set it in the body parameter or in your cookies.',
        },
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  it('should throw error when refresh token is invalid', async () => {
    // ===== Arrange
    authService.refreshAuthenticationTokens.mockRejectedValue(
      new Error('Invalid or expired refresh token.'),
    );

    // ===== Act & Assert
    await expect(
      handler.execute({
        refreshToken: 'invalid-token',
      }),
    ).rejects.toThrow(
      new HttpException(
        { message: 'Invalid or expired refresh token.' },
        HttpStatus.BAD_REQUEST,
      ),
    );
  });
});
