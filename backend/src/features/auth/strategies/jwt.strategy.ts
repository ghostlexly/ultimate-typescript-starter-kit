import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../auth.constants';
import { DatabaseService } from 'src/features/application/services/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private db: DatabaseService) {
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
      secretOrKey: Buffer.from(jwtConstants.publicKey, 'base64').toString(
        'utf8',
      ),
    });
  }

  async validate(payload: any) {
    try {
      const sessionId = payload.sub;

      // Get account by id
      const account = await this.db.prisma.account.findFirst({
        include: {
          admin: true,
          customer: true,
        },
        where: { sessions: { some: { id: sessionId } } },
      });

      if (!account) {
        return false;
      }

      return account;
    } catch {
      return false;
    }
  }
}
