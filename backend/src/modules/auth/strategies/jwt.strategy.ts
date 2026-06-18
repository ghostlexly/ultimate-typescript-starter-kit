import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from 'src/modules/shared/services/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly db: DatabaseService,
    configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
      if (!jwt.sessionId) {
        this.logger.error("JWT token's payload is missing !");
        return false;
      }

      const accountId = jwt.sub;
      const role = jwt.role;
      const sessionId = jwt.sessionId;
      const email = jwt.email;

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
