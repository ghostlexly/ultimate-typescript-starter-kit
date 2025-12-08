import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from 'src/features/application/services/database.service';

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

  validate(jwt: any) {
    try {
      if (!jwt.payload) {
        this.logger.error("JWT token's payload is missing !");
        return false;
      }

      const sessionId = jwt.payload.sub;
      const role = jwt.payload.role;
      const accountId = jwt.payload.accountId;
      const email = jwt.payload.email;

      if (!sessionId) {
        this.logger.error("Session ID is missing in JWT token's payload !");
        return false;
      }

      if (!role) {
        this.logger.error("Role is missing in JWT token's payload !");
        return false;
      }

      if (!accountId) {
        this.logger.error("Account ID is missing in JWT token's payload !");
        return false;
      }

      if (!email) {
        this.logger.error("Email is missing in JWT token's payload !");
        return false;
      }

      return {
        sessionId,
        role,
        accountId,
        email,
      };
    } catch {
      return false;
    }
  }
}
