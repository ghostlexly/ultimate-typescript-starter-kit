import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { SignInHandler } from './sign-in.handler';
import { SignInCommand } from './sign-in.command';
import { DatabaseService } from 'src/features/application/services/database.service';
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

describe('SignInHandler', () => {
  let handler: SignInHandler;
  let db: DeepMockProxy<DatabaseService>;
  let authService: DeepMockProxy<AuthService>;
  let mockResponse: DeepMockProxy<Response>;

  beforeEach(async () => {
    mockResponse = mockDeep<Response>();

    const app = await Test.createTestingModule({
      providers: [SignInHandler],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          return mockDeep(token);
        }
      })
      .compile();

    handler = app.get(SignInHandler);
    db = app.get(DatabaseService);
    authService = app.get(AuthService);
  });

  it('should successfully sign in with valid credentials', async () => {
    // ===== Arrange
    const fakeAccount = createMockAccount();
    const accountWithPassword = { ...fakeAccount, password: 'hashed-password' };
    db.prisma.account.findFirst.mockResolvedValue(accountWithPassword);
    authService.comparePassword.mockResolvedValue(true);
    authService.createSession.mockResolvedValue(createMockSession());
    authService.generateAuthenticationTokens.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    // ===== Act
    const result = await handler.execute(
      new SignInCommand({
        data: { email: 'test@test.com', password: 'password' },
        res: mockResponse,
      }),
    );

    // ===== Assert
    expect(result).toEqual({
      role: accountWithPassword.role,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(authService.setAuthCookies).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    );
  });

  it('should throw error when account does not exist', async () => {
    // ===== Arrange
    db.prisma.account.findFirst.mockResolvedValue(null);
    authService.comparePassword.mockResolvedValue(false);

    // ===== Act & Assert
    await expect(
      handler.execute(
        new SignInCommand({
          data: { email: 'test@test.com', password: 'password' },
          res: mockResponse,
        }),
      ),
    ).rejects.toThrow(
      new HttpException(
        { message: 'Mot de passe ou e-mail incorrect.' },
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  it('should throw error when account has no password (OAuth only)', async () => {
    // ===== Arrange
    const accountWithoutPassword = createMockAccount({
      password: null,
    });
    db.prisma.account.findFirst.mockResolvedValue(accountWithoutPassword);

    // ===== Act & Assert
    await expect(
      handler.execute(
        new SignInCommand({
          data: { email: 'test@test.com', password: 'password' },
          res: mockResponse,
        }),
      ),
    ).rejects.toThrow(
      new HttpException(
        {
          message:
            'You have previously signed up with another service like Google, please use the appropriate login method for this account.',
        },
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  it('should throw error when password is invalid', async () => {
    // ===== Arrange
    const accountWithPassword = createMockAccount({
      password: 'hashed-password',
    });
    db.prisma.account.findFirst.mockResolvedValue(accountWithPassword);
    authService.comparePassword.mockResolvedValue(false);

    // ===== Act & Assert
    await expect(
      handler.execute(
        new SignInCommand({
          data: { email: 'test@test.com', password: 'wrong-password' },
          res: mockResponse,
        }),
      ),
    ).rejects.toThrow(
      new HttpException(
        { message: 'Mot de passe ou e-mail incorrect.' },
        HttpStatus.BAD_REQUEST,
      ),
    );
  });
});
