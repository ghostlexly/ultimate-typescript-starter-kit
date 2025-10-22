import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { authConstants } from '../auth.constants';
import { DatabaseService } from 'src/features/application/services/database.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Account } from 'src/generated/prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger(JwtStrategy.name);

  constructor(
    private db: DatabaseService,
    configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract the token from the URL query parameter
        ExtractJwt.fromUrlQueryParameter('token'),

        // Extract the token from the Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),

        // Extract the token from the cookies
        (req) => req?.cookies?.lunisoft_access_token as string,
      ]),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKey: Buffer.from(
        configService.getOrThrow<string>('APP_JWT_PUBLIC_KEY'),
        'base64',
      ).toString('utf8'),
    });
  }

  async validate(jwt: any) {
    try {
      if (!jwt.payload) {
        this.logger.error("JWT token's payload is missing !");
        return false;
      }

      const sessionId = jwt.payload.sub;

      if (!sessionId) {
        this.logger.error("Session ID is missing in JWT token's payload !");
        return false;
      }

      // Get account by session id from cache
      const cachedAccount = await this.cacheManager.get<Account>(
        `session:${sessionId}`,
      );

      // If the account is found in the cache, return it
      if (cachedAccount) {
        return cachedAccount;
      }

      // If the account is not found in the cache, get it from the database
      const account = await this.db.prisma.account.findFirst({
        include: {
          admin: true,
          customer: true,
        },
        where: { sessions: { some: { id: sessionId } } },
      });

      // If the account is not found in the database, return false (authentication failed)
      if (!account) {
        return false;
      }

      // If the account is found in the database, cache it
      await this.cacheManager.set(
        `session:${sessionId}`,
        account,
        authConstants.accessTokenExpirationMinutes * 60 * 1000, // Convert minutes to milliseconds
      );

      return account;
    } catch {
      return false;
    }
  }
}
