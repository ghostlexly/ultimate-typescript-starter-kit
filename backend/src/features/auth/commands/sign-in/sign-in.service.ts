import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignInCommand } from './sign-in.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { dateUtils } from 'src/core/utils/date';
import { authConstants } from '../../auth.constants';
import { Email } from '../../domain/value-objects';
import { ACCOUNT_REPOSITORY } from '../../domain/ports';
import type { AccountRepositoryPort } from '../../domain/ports';

export interface SignInResult {
  accountId: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

@CommandHandler(SignInCommand)
export class SignInService
  implements ICommandHandler<SignInCommand, SignInResult>
{
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepositoryPort,
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: SignInCommand): Promise<SignInResult> {
    const email = Email.create(command.email);

    const account = await this.accountRepository.findByEmail(email);

    if (!account) {
      throw new HttpException(
        { message: 'Mot de passe ou e-mail incorrect.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (account.isOAuthAccount) {
      throw new HttpException(
        {
          message:
            'You have previously signed up with another service like Google, please use the appropriate login method for this account.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isValidPassword = await account.validatePassword(command.password);

    if (!isValidPassword) {
      throw new HttpException(
        { message: 'Mot de passe ou e-mail incorrect.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create session
    const session = await this.db.prisma.session.create({
      data: {
        accountId: account.id,
        expiresAt: dateUtils.add(new Date(), {
          minutes: authConstants.refreshTokenExpirationMinutes,
        }),
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      session.id,
      account.id,
      account.role,
      account.email,
    );

    return {
      accountId: account.id,
      role: account.role,
      accessToken,
      refreshToken,
    };
  }

  private async generateTokens(
    sessionId: string,
    accountId: string,
    role: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: sessionId,
      accountId,
      role,
      email,
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
