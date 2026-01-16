import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { RefreshTokenHandler } from './refresh-token.handler';
import { RefreshTokenCommand } from './refresh-token.command';
import { AuthService } from '../../auth.service';
import type { Response } from 'express';

function createMockAccount(overrides = {}): any {
  return {
    id: 'account-123',
    email: 'test@test.com',
    role: 'CUSTOMER',
    password: 'hashed-password',
    providerId: null,
    providerAccountId: null,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMockSession(overrides = {}): any {
  return {
    id: 'session-123',
    accountId: 'account-123',
    ipAddress: '127.0.0.1',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    account: createMockAccount(),
    ...overrides,
  };
}

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
      session: createMockSession(),
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    // ===== Act
    const result = await handler.execute(
      new RefreshTokenCommand({
        data: { refreshToken: 'valid-refresh-token' },
        res: mockResponse,
      }),
    );

    // ===== Assert
    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

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
        new RefreshTokenCommand({
          data: { refreshToken: '' },
          res: mockResponse,
        }),
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
          data: { refreshToken: 'invalid-token' },
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
