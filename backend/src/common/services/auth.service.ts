import jwt from "jsonwebtoken";
import { authConfig } from "@/modules/auth/auth.config";
import { prisma } from "../database/prisma";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { env } from "@/config";

class AuthService {
  /**
   *  Method to generate a secure unique token
   */
  generateUniqueToken = ({ length = 32 }: { length?: number } = {}) => {
    const result = crypto.randomBytes(length);
    return result.toString("hex");
  };

  comparePassword = async ({
    password,
    hashedPassword,
  }: {
    password: string;
    hashedPassword: string;
  }) => {
    return await bcrypt.compare(password, hashedPassword);
  };

  hashPassword = async ({ password }: { password: string }) => {
    return await bcrypt.hash(password, 10);
  };

  /**
   * Authenticate a token and return the user
   */
  authenticateToken = async (token: string) => {
    try {
      // Verify and decode the JWT token
      const payload = jwt.verify(token, env.APP_JWT_SECRET) as { sub: string };

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
        env.APP_JWT_SECRET,
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
