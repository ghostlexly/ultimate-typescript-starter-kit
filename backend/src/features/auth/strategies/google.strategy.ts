import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { dateUtils } from 'src/core/utils/date';
import { DatabaseService } from 'src/features/application/services/database.service';
import { Account } from 'src/generated/prisma/client';
import { OAuthRedirectException } from '../../../core/exceptions/oauth-redirect.exception';
import { authConstants } from '../auth.constants';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private logger = new Logger(GoogleStrategy.name);
  private readonly appBaseUrl: string;

  constructor(
    private db: DatabaseService,
    configService: ConfigService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('API_GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>(
        'API_GOOGLE_CLIENT_SECRET',
      ),
      callbackURL: `${configService.getOrThrow<string>('APP_BASE_URL')}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });

    this.appBaseUrl = configService.getOrThrow<string>('APP_BASE_URL');
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { googleId, email } = this.extractProfileData({ profile });
      const account = await this.findOrCreateAccount({ googleId, email });
      const session = await this.createSession({ accountId: account.id });

      return done(null, {
        sessionId: session.id,
        accountId: account.id,
        role: account.role,
        email: account.email,
      });
    } catch (error) {
      if (error instanceof OAuthRedirectException) {
        throw error;
      }

      this.logger.error('Error during Google OAuth validation:', error);
      throw new OAuthRedirectException(
        `${this.appBaseUrl}/auth/signin`,
        'INTERNAL_SERVER_ERROR',
      );
    }
  }

  private extractProfileData({ profile }: { profile: any }): {
    googleId: string;
    email: string;
  } {
    const { id: googleId, emails } = profile;

    if (!emails || emails.length === 0) {
      this.logger.error('No email found in Google profile');
      throw new OAuthRedirectException(
        `${this.appBaseUrl}/auth/signin`,
        'EMAIL_NOT_FOUND',
      );
    }

    return { googleId, email: emails[0].value };
  }

  private async findOrCreateAccount({
    googleId,
    email,
  }: {
    googleId: string;
    email: string;
  }): Promise<Account> {
    // 1. Find by Google ID
    const existingByGoogleId = await this.db.prisma.account.findFirst({
      where: { providerId: 'google', providerAccountId: googleId },
    });

    if (existingByGoogleId) {
      return existingByGoogleId;
    }

    // 2. Find by email and link Google account
    const existingByEmail = await this.db.prisma.account.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      this.logger.log(`Linked Google account to existing customer: ${email}`);
      return this.db.prisma.account.update({
        where: { id: existingByEmail.id },
        data: { providerId: 'google', providerAccountId: googleId },
      });
    }

    // 3. Create new account
    this.logger.log(`Created new customer via Google OAuth: ${email}`);
    return this.db.prisma.account.create({
      data: {
        role: 'CUSTOMER',
        email,
        providerId: 'google',
        providerAccountId: googleId,
        customer: { create: {} },
      },
    });
  }

  private async createSession({ accountId }: { accountId: string }) {
    return this.db.prisma.session.create({
      data: {
        expiresAt: dateUtils.add(new Date(), {
          minutes: authConstants.refreshTokenExpirationMinutes,
        }),
        accountId,
      },
    });
  }
}
