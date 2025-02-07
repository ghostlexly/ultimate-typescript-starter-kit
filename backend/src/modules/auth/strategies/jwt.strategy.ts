import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { Account } from "@prisma/client";
import { prisma } from "#/common/database/prisma";
import { configService } from "#/common/services/config.service";

export const initializeJwtStrategy = async () => {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: configService.getOrThrow("APP_JWT_SECRET"),
      },
      async (
        payload: { sub: string },
        done: (error: Error | null, account?: Account | false) => void
      ) => {
        try {
          // Get account by id
          const account = await prisma.account.findFirst({
            include: {
              admin: true,
              customer: true,
            },
            where: { id: payload.sub },
          });

          if (!account) {
            return done(null, false);
          }

          return done(null, account);
        } catch {
          return done(null, false);
        }
      }
    )
  );
};
