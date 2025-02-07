import jwt from "jsonwebtoken";
import { configService } from "./config.service";
import { authConfig } from "#/modules/auth/auth.config";
import { prisma } from "../database/prisma";

class AuthService {
  /**
   * Authenticate a token and return the user
   */
  authenticateToken = async (token: string) => {
    try {
      // Verify and decode the JWT token
      const payload = jwt.verify(
        token,
        configService.getOrThrow("APP_JWT_SECRET")
      ) as { sub: string };

      // Get account by id
      const account = await prisma.account.findFirst({
        include: {
          admin: true,
          customer: true,
        },
        where: { id: payload.sub },
      });

      // Check if the account is valid
      if (!account) {
        throw new Error("Invalid token.");
      }

      return account;
    } catch {
      return null;
    }
  };

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
