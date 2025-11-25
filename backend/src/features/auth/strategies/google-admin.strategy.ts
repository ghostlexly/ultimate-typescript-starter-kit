import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { DatabaseService } from 'src/features/application/services/database.service';
import { OAuthRedirectException } from '../exceptions/oauth-redirect.exception';

@Injectable()
export class GoogleAdminStrategy extends PassportStrategy(
  Strategy,
  'google-admin',
) {
  private logger = new Logger(GoogleAdminStrategy.name);
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
      callbackURL: `${configService.getOrThrow<string>('APP_BASE_URL')}/api/auth/google/admin/callback`,
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
          `${this.appBaseUrl}/admin-area/signin`,
          'EMAIL_NOT_FOUND',
        );
      }

      const email = emails[0].value;

      // Check if admin exists with this Google ID
      let admin = await this.db.prisma.admin.findUnique({
        where: { googleId: id },
      });

      // If not found by Google ID, check by email
      if (!admin) {
        admin = await this.db.prisma.admin.findUnique({
          where: { email },
        });

        // If admin exists with this email but no Google ID, link the account
        if (admin) {
          admin = await this.db.prisma.admin.update({
            where: { id: admin.id },
            data: { googleId: id },
          });

          this.logger.log(`Linked Google account to existing admin: ${email}`);
        } else {
          // Admin account doesn't exist - reject authentication
          this.logger.error(
            `Admin account not found for Google login: ${email}`,
          );

          throw new OAuthRedirectException(
            `${this.appBaseUrl}/admin-area/signin`,
            'ADMIN_ACCOUNT_NOT_FOUND',
          );
        }
      }

      // Fetch the complete account with relations
      const account = await this.db.prisma.account.findUnique({
        where: { id: admin.accountId },
        include: {
          admin: true,
          customer: true,
        },
      });

      if (!account) {
        this.logger.error('Account not found after admin update');

        throw new OAuthRedirectException(
          `${this.appBaseUrl}/admin-area/signin`,
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
        `${this.appBaseUrl}/admin-area/signin`,
        'INTERNAL_SERVER_ERROR',
      );
    }
  }
}
