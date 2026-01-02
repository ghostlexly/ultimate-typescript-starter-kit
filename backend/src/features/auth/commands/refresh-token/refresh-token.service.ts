import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenCommand } from './refresh-token.command';
import { dateUtils } from 'src/core/utils/date';
import { authConstants } from '../../auth.constants';
import {
  ACCOUNT_REPOSITORY,
  SESSION_REPOSITORY,
} from '../../domain/ports';
import type {
  AccountRepositoryPort,
  SessionRepositoryPort,
} from '../../domain/ports';

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenService
  implements ICommandHandler<RefreshTokenCommand, RefreshTokenResult>
{
  private readonly jwtPublicKey: string;

  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepositoryPort,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepositoryPort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const jwtPublicKey = this.configService.get<string>('APP_JWT_PUBLIC_KEY');

    if (jwtPublicKey) {
      this.jwtPublicKey = Buffer.from(jwtPublicKey, 'base64').toString('utf8');
    }
  }

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    // Verify the refresh token
    let jwt: { payload?: { sub?: string } };

    try {
      jwt = await this.jwtService.verifyAsync(command.refreshToken, {
        algorithms: ['RS256'],
        secret: this.jwtPublicKey,
      });
    } catch {
      throw new HttpException(
        { message: 'Invalid or expired refresh token.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!jwt?.payload?.sub) {
      throw new HttpException(
        { message: 'This token does not provide a payload.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Find session
    const session = await this.sessionRepository.findById(jwt.payload.sub);

    if (!session || session.isExpired) {
      throw new HttpException(
        { message: 'This session does not exist.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Find account
    const account = await this.accountRepository.findById(session.accountId);

    if (!account) {
      throw new HttpException(
        { message: 'Account not found.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Extend session (Refresh Token Rotation)
    session.extend(
      dateUtils.add(new Date(), {
        minutes: authConstants.refreshTokenExpirationMinutes,
      }),
    );

    await this.sessionRepository.save(session);

    // Generate new tokens
    const payload = {
      sub: session.id,
      accountId: account.id,
      role: account.role,
      email: account.email,
    };

    const accessToken = await this.jwtService.signAsync({
      payload,
      options: { expiresIn: `${authConstants.accessTokenExpirationMinutes}m` },
    });

    const refreshToken = await this.jwtService.signAsync({
      payload,
      options: { expiresIn: `${authConstants.refreshTokenExpirationMinutes}m` },
    });

    return { accessToken, refreshToken };
  }
}
