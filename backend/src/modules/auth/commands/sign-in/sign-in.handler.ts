import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { AuthService } from '../../auth.service';
import type { Account } from 'src/generated/prisma/client';

@Injectable()
export class SignInHandler {
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  async execute({ email, password }: { email: string; password: string }) {
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

      throw new BadRequestException('Mot de passe ou e-mail incorrect.');
    }

    if (!account.password) {
      throw new BadRequestException(
        'You have previously signed up with another service like Google, please use the appropriate login method for this account.',
      );
    }

    // Hash given password and compare it to the stored hash
    const validPassword = await this.authService.comparePassword({
      password: password,
      hashedPassword: account.password,
    });

    if (!validPassword) {
      throw new BadRequestException('Mot de passe ou e-mail incorrect.');
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

    return {
      role: account.role,
      accessToken,
      refreshToken,
    };
  }
}
