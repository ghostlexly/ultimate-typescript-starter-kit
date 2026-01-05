import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { RefreshTokenHandler } from './refresh-token.handler';
import { RefreshTokenCommand } from './refresh-token.command';
import { AuthService } from '../../auth.service';
import { fakeSession } from 'src/test/fixtures/auth.fixtures';
import type { Response } from 'express';

describe('RefreshTokenHandler', () => {
  let handler: RefreshTokenHandler;
  let authService: DeepMockProxy<AuthService>;
  let mockResponse: DeepMockProxy<Response>;

  beforeEach(async () => {
    mockResponse = mockDeep<Response>();

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
      session: fakeSession,
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    // ===== Act
    const result = await handler.execute(
      new RefreshTokenCommand({
        refreshToken: 'valid-refresh-token',
        res: mockResponse,
      }),
    );

    // ===== Assert
    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authService.setAuthCookies).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
    );
  });

  it('should throw error when refresh token is not provided', async () => {
    // ===== Act & Assert
    await expect(
      handler.execute(
        new RefreshTokenCommand({ refreshToken: '', res: mockResponse }),
      ),
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
      handler.execute(
        new RefreshTokenCommand({
          refreshToken: 'invalid-token',
          res: mockResponse,
        }),
      ),
    ).rejects.toThrow(
      new HttpException(
        { message: 'Invalid or expired refresh token.' },
        HttpStatus.BAD_REQUEST,
      ),
    );
  });
});
