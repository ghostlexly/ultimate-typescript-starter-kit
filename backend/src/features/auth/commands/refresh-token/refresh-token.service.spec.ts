import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { RefreshTokenService } from './refresh-token.service';
import {
  fakeAccount,
  fakeJwtPayload,
  fakeSession,
} from 'src/test/fixtures/auth.fixtures';
import {
  ACCOUNT_REPOSITORY,
  SESSION_REPOSITORY,
} from '../../domain/ports';
import type {
  AccountRepositoryPort,
  SessionRepositoryPort,
} from '../../domain/ports';
import { Account, Session } from '../../domain/entities';

describe('RefreshTokenService', () => {
  let refreshTokenService: RefreshTokenService;
  let sessionRepository: DeepMockProxy<SessionRepositoryPort>;
  let accountRepository: DeepMockProxy<AccountRepositoryPort>;
  let jwtService: DeepMockProxy<JwtService>;

  beforeEach(async () => {
    sessionRepository = mockDeep<SessionRepositoryPort>();
    accountRepository = mockDeep<AccountRepositoryPort>();

    const app = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          useFactory: () => ({
            privateKey: Buffer.from(
              'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRREVDK2xTVjdsRXlkcVUKbDlVcmQ4emp3QXlFZ1BuR0NBUU1QZVFXQlVQWXhPREhsZTI5cjlIVDdoRUtPaDlIL0hMOUhrYVFZL3ZUTFRGWgpJL3BiQW4wMjVaYUNLSFFQU0xjSlpuNG4xVFdVbnJCWnM5cGxqak5CQUUyRmh6UVh5WGxGcE42SndiVkc4VGxzCmd4UmRnWSsrM0ZycXg4ZzQzbUdnVjdNQUh6Snk1MG5zTTVkSkdvZ2ZuaFpQa3JzRVNHY1RybmZEWXI1bFdEclIKVVlmYkQ0TThRSWpORHo0Z1VkYm9xYmJaenNIREV6My9NVFl5Y1hTWFFJSnBZZGwyL29wYUNjLy9NWnBpUmZVUQpOUTNMTEQ4OUlyd2RHRGRsZURsQmo4YVhybDZFemdWYnpIQzR4R3VtOFpaT3FXMklQTnBvb0taa1BuSVZWWDNSCmIzY2xRMmlkQWdNQkFBRUNnZ0VBVHJoSHRvQXlEUHlPaitjTnVqZ1BKZzVxR0ZTZnR0Um1KN0k4WVZrNDNwUmoKZTlEb2x5ZS90ZjBjaTRJK0tFNG1zQnVWa3dvS3hzZVpUcVZqTkdNaCswYWlNbDVqQi9ZWFJTZUtGWjJIdDhjbQpvY1pWdGp5c3VQZVJxVUhhZVlpMWNQRWNTSzFuQ0hiNUsyalE1eUVNb3NOaG9HK2JKcmFvOWRUeE0rWFRBSTdJCnRTK0EzdWhTMXg2TlpDM1Ayd2dWcHBPMWdmbllKTVQ0eVdISmlWdHpGYW56d1RUWG1EUkdCTzZldzJZbytVbTgKVU9JZmJJL3RYZy84Q3FtZ3c2K0tkbkdlYVpVWllJMTRETmxNdEcxdEIvVmpOVENZZU1DYnA0OEVPV25OR3VNMgptUGppNFNUb0w4SHJocHFoUHAzMkFMSUlNc0hCN0ZBUW0yQTJPS2pBWXdLQmdRRDZtNGl3clVKQzZCVXpQSE8xCmRqSDBQV0k5ZmkvVU9hbFZtUkgxbXI4OE1lem5VSmF4K2tDVzdnem9haFBxbG1DS2pjUmFFUHNvemEvN1psZEsKK0lJM0RJaWRzdTEydWo5UkxvOXo4RDdPQXAxVWFLd21TZVdLcEhBeVg4d2ZkZ2t0L3FZTFlNZTd0VkZKSExtMQpDVjdCMlk2dDFzKzNrTGJ2bm4vd2ZjOVcyd0tCZ1FESVE5Uk1XSjhuZlFkTFB2Ry9LemkxamtXd2czNkh0MXAxCnNYbHpENzhEV3g1RjNzYi9NVjRzT1ZwRHBUWDY2b28rMy9kZ0d2Tll3QXJNaUVrVWNuTHlNU3UzalROLzc0bnIKZ3VISnpFYVUweXBtNHdsSk93cnBwRzF3bzIvK2tEajhPMGxlcnp4VWlEZGJXV2JkL1h0VFJyVVVDQlIvcHcvVQprQno4QjZQcjV3S0JnUUNra3N0Ykt3eWVuNFo4bFRCdmRHVXR2Ym5zSkJnSXlLMFpWMkpoNWZPNzloVmJlcUxiCjBqbmtaQVA2Qk45N2FMR1JpN1BzYWNabWIxMG9QWGNKOXRTY2poQ1JiMVZlYU1UMzdSbXJ5NU9TK2tpVGpBR3gKUzBvQW1DaE9ESGNpR2dQQlByK1FMVWc5VHI5SXdpSjZidUxaYnFPeUthVlRLU2ZaaUQ4QWtiNDlqUUtCZ0VwQQpjL2QycUZQdzFJSityUTF2VGhCcTFzWHlpemh3c0JhUkhmR2VkZmtka0tUaFM3RVVzZEQ5MXN6YjlaNjUxVllvCm5rVEEyVmNmcFNGZXFwSHRPVmM1Q2ZkOVlBbmdXNmU1bUZQRTdLcURmT1kyNlp1QVM3U0RKWnlzekhwN0tOWEUKZVppa3FsN0JQcDBkRWJuZklSbW9UcjFGbmF3UzJoaTY4alF6OVFBakFvR0FEU3RMNTBYbVhETWU1TENtMy9Fawpab0FZZW9uNkFHVmY1c2xhNE40eWFkZ1VnakdCRDRlQjB2RjlSRG56TU5IQW5oZnFGM0lOVnVGMWFPK2pGSXlLCjdDOWJnSmNQd0xuMXFPWWRFbHFSN1pUMnlLOWR5OTVHazNxaUEwZEVRUjdIc3pxY0NKTFpqbjd0eVd4a0dBbXUKUi9hSEJ5dkR2WWxwb3BkUFpJZ2VFVVE9Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K',
              'base64',
            ).toString('utf8'),
            publicKey: Buffer.from(
              'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF4QXZwVWxlNVJNbmFsSmZWSzNmTQo0OEFNaElENXhnZ0VERDNrRmdWRDJNVGd4NVh0dmEvUjArNFJDam9mUi94eS9SNUdrR1A3MHkweFdTUDZXd0o5Ck51V1dnaWgwRDBpM0NXWitKOVUxbEo2d1diUGFaWTR6UVFCTmhZYzBGOGw1UmFUZWljRzFSdkU1YklNVVhZR1AKdnR4YTZzZklPTjVob0ZlekFCOHljdWRKN0RPWFNScUlINTRXVDVLN0JFaG5FNjUzdzJLK1pWZzYwVkdIMncrRApQRUNJelE4K0lGSFc2S20yMmM3Qnd4TTkvekUyTW5GMGwwQ0NhV0haZHY2S1dnblAvekdhWWtYMUVEVU55eXcvClBTSzhIUmczWlhnNVFZL0dsNjVlaE00Rlc4eHd1TVJycHZHV1RxbHRpRHphYUtDbVpENXlGVlY5MFc5M0pVTm8KblFJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==',
              'base64',
            ).toString('utf8'),
            signOptions: { algorithm: 'RS256' },
          }),
        }),
      ],
      providers: [
        RefreshTokenService,
        {
          provide: SESSION_REPOSITORY,
          useValue: sessionRepository,
        },
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

    refreshTokenService = app.get(RefreshTokenService);
    jwtService = app.get(JwtService);
  });

  describe('execute', () => {
    it('should return new tokens when refresh token is valid', async () => {
      // ===== Arrange
      const validRefreshToken = await jwtService.signAsync({
        payload: fakeJwtPayload,
        options: {
          expiresIn: `5m`,
        },
      });

      const session = Session.fromPersistence({
        id: fakeSession.id,
        accountId: fakeSession.accountId,
        ipAddress: fakeSession.ipAddress,
        userAgent: fakeSession.userAgent,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      });

      const account = Account.fromPersistence({
        id: fakeAccount.id,
        email: fakeAccount.email,
        password: fakeAccount.password,
        role: fakeAccount.role as 'ADMIN' | 'CUSTOMER',
        providerId: fakeAccount.providerId,
        providerAccountId: fakeAccount.providerAccountId,
        isEmailVerified: fakeAccount.isEmailVerified,
      });

      sessionRepository.findById.mockResolvedValue(session);
      accountRepository.findById.mockResolvedValue(account);
      sessionRepository.save.mockResolvedValue();

      // ===== Act
      const result = await refreshTokenService.execute({
        refreshToken: validRefreshToken,
      });

      // ===== Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(sessionRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if the token is invalid', async () => {
      // ===== Act & Assert
      await expect(
        refreshTokenService.execute({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(
        new HttpException(
          { message: 'Invalid or expired refresh token.' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if the session does not exist', async () => {
      // ===== Arrange
      const validRefreshToken = await jwtService.signAsync({
        payload: fakeJwtPayload,
        options: {
          expiresIn: `5m`,
        },
      });
      sessionRepository.findById.mockResolvedValue(null);

      // ===== Act & Assert
      await expect(
        refreshTokenService.execute({
          refreshToken: validRefreshToken,
        }),
      ).rejects.toThrow(
        new HttpException(
          { message: 'This session does not exist.' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});
