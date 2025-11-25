import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { DatabaseService } from 'src/features/application/services/database.service';
import { OAuthRedirectException } from '../exceptions/oauth-redirect.exception';

@Injectable()
export class GoogleCustomerStrategy extends PassportStrategy(
  Strategy,
  'google-customer',
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
      callbackURL: `${configService.getOrThrow<string>('APP_BASE_URL')}/api/auth/google/customer/callback`,
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
          `${this.appBaseUrl}/customer-area/signin`,
          'EMAIL_NOT_FOUND',
        );
      }

      const email = emails[0].value;

      // Check if customer exists with this Google ID
      let customer = await this.db.prisma.customer.findUnique({
        where: { googleId: id },
      });

      // If not found by Google ID, check by email
      if (!customer) {
        customer = await this.db.prisma.customer.findUnique({
          where: { email },
        });

        // If customer exists with this email but no Google ID, link the account
        if (customer) {
          customer = await this.db.prisma.customer.update({
            where: { id: customer.id },
            data: { googleId: id },
          });

          this.logger.log(
            `Linked Google account to existing customer: ${email}`,
          );
        }
      }

      // If still no customer, create a new one
      if (!customer) {
        const account = await this.db.prisma.account.create({
          data: {
            role: 'CUSTOMER',
          },
        });

        customer = await this.db.prisma.customer.create({
          data: {
            email,
            googleId: id,
            accountId: account.id,
            password: null,
          },
        });

        this.logger.log(`Created new customer via Google OAuth: ${email}`);
      }

      // Fetch the complete account with relations
      const account = await this.db.prisma.account.findUnique({
        where: { id: customer.accountId },
        include: {
          admin: true,
          customer: true,
        },
      });

      if (!account) {
        this.logger.error('Account not found after customer creation/update');

        throw new OAuthRedirectException(
          `${this.appBaseUrl}/customer-area/signin`,
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
        `${this.appBaseUrl}/customer-area/signin`,
        'INTERNAL_SERVER_ERROR',
      );
    }
  }
}
