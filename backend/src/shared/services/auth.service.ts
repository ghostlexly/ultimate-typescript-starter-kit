import { prisma } from "#/infrastructure/database/prisma";
import jwt from "jsonwebtoken";
import { configService } from "./config.service";
import { AUTH_TOKEN_EXPIRATION_HOURS } from "../constants/auth.constants";

class AuthService {
  /**
   * Generate a JWT token for a given account id.
   */
  generateJwtToken = async ({
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
          expiresIn: `${AUTH_TOKEN_EXPIRATION_HOURS}h`,
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
