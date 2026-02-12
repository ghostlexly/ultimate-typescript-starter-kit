import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { SignInHandler } from './sign-in.handler';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { AuthService } from '../../auth.service';
import { createMockAccount } from 'src/__tests__/factories/account.factory';
import { createMockSession } from 'src/__tests__/factories/session.factory';

describe('SignInHandler', () => {
  let handler: SignInHandler;
  let db: DeepMockProxy<DatabaseService>;
  let authService: DeepMockProxy<AuthService>;

  beforeEach(async () => {
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
    const result = await handler.execute({
      email: 'test@test.com',
      password: 'password',
    });

    // ===== Assert
    expect(result).toEqual({
      role: accountWithPassword.role,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('should throw error when account does not exist', async () => {
    // ===== Arrange
    db.prisma.account.findFirst.mockResolvedValue(null);
    authService.comparePassword.mockResolvedValue(false);

    // ===== Act & Assert
    await expect(
      handler.execute({
        email: 'test@test.com',
        password: 'password',
      }),
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
      handler.execute({
        email: 'test@test.com',
        password: 'password',
      }),
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
      handler.execute({
        email: 'test@test.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(
      new HttpException(
        { message: 'Mot de passe ou e-mail incorrect.' },
        HttpStatus.BAD_REQUEST,
      ),
    );
  });
});
