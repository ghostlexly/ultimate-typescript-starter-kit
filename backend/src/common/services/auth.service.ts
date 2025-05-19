import jwt from "jsonwebtoken";
import { authConfig } from "@/modules/auth/auth.config";
import { prisma } from "../database/prisma";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { env } from "@/config";
import { dateUtils } from "../utils/date";
import { Role } from "@/generated/prisma/client";

class AuthService {
  signJwt = ({
    payload,
    options,
  }: {
    payload: string | Buffer | object;
    options: jwt.SignOptions;
  }): Promise<string> => {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, env.APP_JWT_SECRET, options, (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token as string);
        }
      });
    });
  };

  getJwtPayload = (token: string): Promise<{ sub: string; role: Role }> => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, env.APP_JWT_SECRET, (err, payload) => {
        if (err) {
          reject(err);
        } else {
          resolve(payload as { sub: string; role: Role });
        }
      });
    });
  };

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
   * Generate a JWT access token for a given account id.
   */
  generateAuthenticationTokens = async ({
    accountId,
  }: {
    accountId: string;
  }): Promise<{ accessToken: string; refreshToken: string }> => {
    // Get the user
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error("Account does not exist.");
    }

    // Create a new session
    const session = await prisma.session.create({
      data: {
        expiresAt: dateUtils.add(new Date(), {
          minutes: authConfig.refreshTokenExpirationMinutes,
        }),
        accountId,
      },
    });

    // Generate the JWT access token
    const accessToken = await this.signJwt({
      payload: {
        sub: session.id,
        role: account.role,
      },
      options: {
        expiresIn: `${authConfig.accessTokenExpirationMinutes}m`,
      },
    });

    // Generate the JWT refresh token
    const refreshToken = await this.signJwt({
      payload: {
        sub: session.id,
      },
      options: {
        expiresIn: `${authConfig.refreshTokenExpirationMinutes}m`,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  };

  refreshAuthenticationTokens = async ({
    refreshToken,
  }: {
    refreshToken: string;
  }) => {
    const payload = await this.getJwtPayload(refreshToken).catch(() => {
      throw new Error("Invalid or expired refresh token.");
    });

    if (!payload) {
      throw new Error("Invalid or expired refresh token.");
    }

    const session = await prisma.session.findUnique({
      include: {
        account: true,
      },
      where: {
        id: payload.sub,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      throw new Error("This session does not exist.");
    }

    // Generate the JWT access token
    const accessToken = await this.signJwt({
      payload: {
        sub: session.id,
        role: session.account.role,
      },
      options: {
        expiresIn: `${authConfig.accessTokenExpirationMinutes}m`,
      },
    });

    // Generate the JWT refresh token
    const newRefreshToken = await this.signJwt({
      payload: {
        sub: session.id,
      },
      options: {
        expiresIn: `${authConfig.refreshTokenExpirationMinutes}m`,
      },
    });

    // Update the expiration date of the session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        expiresAt: dateUtils.add(new Date(), {
          minutes: authConfig.refreshTokenExpirationMinutes,
        }),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  };
}

export const authService = new AuthService();
