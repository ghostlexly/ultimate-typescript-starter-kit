import { prisma } from "#/infrastructure/database/prisma";
import jwt from "jsonwebtoken";
import { configService } from "./config.service";
import { authConfig } from "#/modules/auth/auth.config";

class AuthService {
  /**
   * Generate a JWT access token for a given account id.
   */
  generateAccessToken = async ({
    accountId,
  }: {
    accountId: string;
  }): Promise<string> => {
    // -- Get the user
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error("Account not found.");
    }

    // -- Generate the JWT token
    const token = await new Promise<string>((resolve, reject) => {
      jwt.sign(
        {
          sub: accountId,
          role: account.role,
        },
        configService.getOrThrow("APP_JWT_SECRET"),
        {
          expiresIn: `${authConfig.accessTokenExpirationMinutes}m`,
        },
        (err, token) => {
          if (err) reject(err);
          else resolve(token as string);
        }
      );
    });

    return token;
  };
}

export const authService = new AuthService();
