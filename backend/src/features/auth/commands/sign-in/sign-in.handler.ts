import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SignInCommand } from './sign-in.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { AuthService } from '../../auth.service';
import type { Account } from 'src/generated/prisma/client';

@CommandHandler(SignInCommand)
export class SignInHandler implements ICommandHandler<SignInCommand> {
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  async execute({ email, password, res }: SignInCommand) {
    // Verify if user exists
    const account: Account | null = await this.db.prisma.account.findFirst({
      where: {
        email: {
          contains: email,
          mode: 'insensitive',
        },
      },
    });

    if (!account) {
      // When user doesn't exist, still hash a fake password to prevent timing-based account enumeration
      await this.authService.comparePassword({
        password: password,
        hashedPassword: '$2a$10$fakeHashToPreventTimingAttacks',
      });

      throw new HttpException(
        {
          message: 'Mot de passe ou e-mail incorrect.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!account.password) {
      throw new HttpException(
        {
          message:
            'You have previously signed up with another service like Google, please use the appropriate login method for this account.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash given password and compare it to the stored hash
    const validPassword = await this.authService.comparePassword({
      password: password,
      hashedPassword: account.password,
    });

    if (!validPassword) {
      throw new HttpException(
        {
          message: 'Mot de passe ou e-mail incorrect.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create a new session
    const session = await this.authService.createSession({
      accountId: account.id,
    });

    // Generate an access token
    const { accessToken, refreshToken } =
      await this.authService.generateAuthenticationTokens({
        sessionId: session.id,
      });

    // Set authentication cookies
    this.authService.setAuthCookies({
      res,
      accessToken,
      refreshToken,
    });

    return {
      role: account.role,
      accessToken,
      refreshToken,
    };
  }
}
