import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignInCommand } from './sign-in.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { dateUtils } from 'src/core/utils/date';
import { passwordUtils } from 'src/core/utils/password';
import { authConstants } from '../../auth.constants';

export interface SignInResult {
  accountId: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

@CommandHandler(SignInCommand)
export class SignInService implements ICommandHandler<SignInCommand, SignInResult> {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: SignInCommand): Promise<SignInResult> {
    // Find account by email
    const account = await this.db.prisma.account.findFirst({
      where: {
        email: {
          equals: command.email,
          mode: 'insensitive',
        },
      },
    });

    if (!account) {
      // Timing attack protection
      await passwordUtils.compare(
        command.password,
        '$2a$10$fakeHashToPreventTimingAttacks',
      );

      throw new HttpException(
        { message: 'Mot de passe ou e-mail incorrect.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if account has OAuth provider (no password)
    if (account.providerId && !account.password) {
      throw new HttpException(
        {
          message:
            'You have previously signed up with another service like Google, please use the appropriate login method for this account.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate password
    const isValidPassword = await passwordUtils.compare(
      command.password,
      account.password ?? '',
    );

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
