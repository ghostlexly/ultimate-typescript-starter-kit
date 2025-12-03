import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { DatabaseService } from 'src/features/application/services/database.service';
import { OAuthRedirectException } from '../exceptions/oauth-redirect.exception';

@Injectable()
export class GoogleCustomerStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  private logger = new Logger(GoogleCustomerStrategy.name);
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
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, emails } = profile;

      if (!emails || emails.length === 0) {
        this.logger.error('No email found in Google profile');

        throw new OAuthRedirectException(
          `${this.appBaseUrl}/signin`,
          'EMAIL_NOT_FOUND',
        );
      }

      const email = emails[0].value;

      // Check if customer exists with this Google ID
      let account = await this.db.prisma.account.findFirst({
        where: {
          providerId: 'google',
          providerAccountId: id,
        },
      });

      // If not found by Google ID, check by email
      if (!account) {
        account = await this.db.prisma.account.findUnique({
          where: {
            email,
          },
        });

        // If customer exists with this email but no Google ID, link the account
        if (account) {
          account = await this.db.prisma.account.update({
            where: { id: account.id },
            data: { providerId: 'google', providerAccountId: id },
          });

          this.logger.log(
            `Linked Google account to existing customer: ${email}`,
          );
        }
      }

      // If still no customer, create a new one
      if (!account) {
        const existingAccount = await this.db.prisma.account.findUnique({
          where: {
            email,
          },
        });

        if (existingAccount) {
          this.logger.error(
            'This email address is already in use by another account for another role.',
          );

          throw new OAuthRedirectException(
            `${this.appBaseUrl}/signin`,
            'EMAIL_ALREADY_EXISTS',
          );
        }

        account = await this.db.prisma.account.create({
          data: {
            role: 'CUSTOMER',
            email,
            providerId: 'google',
            providerAccountId: id,
            customer: {
              create: {},
            },
          },
        });

        this.logger.log(`Created new customer via Google OAuth: ${email}`);
      }

      // Fetch the complete account with relations
      account = await this.db.prisma.account.findUnique({
        where: { id: account.id },
        include: {
          admin: true,
          customer: true,
        },
      });

      if (!account) {
        this.logger.error('Account not found after customer creation/update');

        throw new OAuthRedirectException(
          `${this.appBaseUrl}/signin`,
          'ACCOUNT_NOT_FOUND',
        );
      }

      return done(null, account as any);
    } catch (error) {
      // Re-throw OAuthRedirectException to be caught by the filter
      if (error instanceof OAuthRedirectException) {
        throw error;
      }

      this.logger.error('Error during Google OAuth validation:', error);

      throw new OAuthRedirectException(
        `${this.appBaseUrl}/signin`,
        'INTERNAL_SERVER_ERROR',
      );
    }
  }
}
