import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { DatabaseService } from 'src/features/application/services/database.service';
import { fakeAccount, fakeSession } from 'src/test/fixtures/auth.fixtures';
import { SignInService } from './sign-in.service';
import { Password } from '../../domain/value-objects';
import { Account } from '../../domain/entities';
import { ACCOUNT_REPOSITORY, AccountRepositoryPort } from '../../domain/ports';

describe('SignInService', () => {
  let signInService: SignInService;
  let db: DeepMockProxy<DatabaseService>;
  let accountRepository: DeepMockProxy<AccountRepositoryPort>;

  beforeEach(async () => {
    accountRepository = mockDeep<AccountRepositoryPort>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        SignInService,
        {
          provide: ACCOUNT_REPOSITORY,
          useValue: accountRepository,
        },
      ],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          return mockDeep(token);
        }
      })
      .compile();

    signInService = moduleRef.get(SignInService);
    db = moduleRef.get(DatabaseService);
  });

  describe('execute', () => {
    it('should throw an error if the account does not exist', async () => {
      // ===== Arrange
      accountRepository.findByEmail.mockResolvedValue(null);

      // ===== Act & Assert
      await expect(
        signInService.execute({
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

    it('should throw an error if the account has OAuth provider and no password', async () => {
      // ===== Arrange
      const oauthAccount = Account.fromPersistence({
        ...fakeAccount,
        providerId: 'google',
        providerAccountId: '123',
        password: null,
      });
      accountRepository.findByEmail.mockResolvedValue(oauthAccount);

      // ===== Act & Assert
      await expect(
        signInService.execute({
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

    it('should throw an error if the password is incorrect', async () => {
      // ===== Arrange
      const hashedPassword = await Password.create('correct-password').hash();
      const accountWithPassword = Account.fromPersistence({
        ...fakeAccount,
        password: hashedPassword.value,
      });
      accountRepository.findByEmail.mockResolvedValue(accountWithPassword);

      // ===== Act & Assert
      await expect(
        signInService.execute({
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

    it('should return tokens when credentials are valid', async () => {
      // ===== Arrange
      const hashedPassword = await Password.create('correct-password').hash();
      const accountWithPassword = Account.fromPersistence({
        ...fakeAccount,
        password: hashedPassword.value,
      });
      accountRepository.findByEmail.mockResolvedValue(accountWithPassword);
      db.prisma.session.create.mockResolvedValue(fakeSession);

      // ===== Act
      const result = await signInService.execute({
        email: 'test@test.com',
        password: 'correct-password',
      });

      // ===== Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accountId).toBe(fakeAccount.id);
      expect(result.role).toBe(fakeAccount.role);
      expect(db.prisma.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            accountId: fakeAccount.id,
          }),
        }),
      );
    });
  });
});
