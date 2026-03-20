import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import type { Response } from 'express';
import { dateUtils } from 'src/core/utils/date';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { authConstants } from './auth.constants';

@Injectable()
export class AuthService {
  private readonly jwtPublicKey: string;

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const jwtPublicKey = this.configService.get<string>('APP_JWT_PUBLIC_KEY');

    if (jwtPublicKey) {
      this.jwtPublicKey = Buffer.from(jwtPublicKey, 'base64').toString('utf8');
    }
  }

  async extractJwtPayload({ token }: { token: string }): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      algorithms: ['RS256'],
      secret: this.jwtPublicKey,
    });
  }

  /**
   * Compare a plain-text password with a bcrypt hash.
   * Kept for CLI commands (create-admin-account, generate-password) and seeders.
   */
  async comparePassword({
    password,
    hashedPassword,
  }: {
    password: string;
    hashedPassword: string;
  }): Promise<boolean> {
    return Boolean(await bcrypt.compare(password, hashedPassword));
  }

  /**
   * Generate a secure unique token (hex string).
   */
  generateUniqueToken({ length = 32 }: { length?: number } = {}) {
    const result = crypto.randomBytes(length);

    return result.toString('hex');
  }

  /**
   * Hash a password with bcrypt.
   * Kept for CLI commands (create-admin-account, generate-password) and seeders.
   */
  async hashPassword({ password }: { password: string }) {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Generate a cryptographically secure 4-digit login code (0000 to 9999).
   */
  generateLoginCode(): string {
    return crypto.randomInt(0, 10000).toString().padStart(4, '0');
  }

  /**
   * Check if a cooldown is active for sending a new login code.
   * Returns the remaining cooldown in seconds, or 0 if no cooldown.
   */
  async getLoginCodeCooldownRemaining({
    accountId,
  }: {
    accountId: string;
  }): Promise<number> {
    const latestToken = await this.db.prisma.verificationToken.findFirst({
      where: {
        accountId,
        type: 'LOGIN_CODE',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestToken) {
      return 0;
    }

    const elapsedSeconds = Math.floor(
      (Date.now() - latestToken.createdAt.getTime()) / 1000,
    );
    const remaining = authConstants.loginCodeCooldownSeconds - elapsedSeconds;

    return Math.max(0, remaining);
  }

  /**
   * Create a login code verification token.
   * Deletes all previous LOGIN_CODE tokens for this account first.
   */
  async createLoginCodeToken({ accountId, code }: { accountId: string; code: string }) {
    // Delete all previous login codes for this account
    await this.db.prisma.verificationToken.deleteMany({
      where: {
        accountId,
        type: 'LOGIN_CODE',
      },
    });

    // Create a new login code token
    return this.db.prisma.verificationToken.create({
      data: {
        type: 'LOGIN_CODE',
        token: code,
        accountId,
        attempts: 0,
        expiresAt: dateUtils.add(new Date(), {
          minutes: authConstants.loginCodeExpirationMinutes,
        }),
      },
    });
  }

  /**
   * Verify a login code with brute-force protection.
   */
  async verifyLoginCode({ email, code }: { email: string; code: string }): Promise<{
    isValid: boolean;
    remainingAttempts: number;
    isMaxAttemptsReached: boolean;
    accountId: string | null;
  }> {
    // Find the account
    const account = await this.db.prisma.account.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (!account) {
      return {
        isValid: false,
        remainingAttempts: 0,
        isMaxAttemptsReached: false,
        accountId: null,
      };
    }

    // Find active login code for this account
    const tokenRecord = await this.db.prisma.verificationToken.findFirst({
      where: {
        accountId: account.id,
        type: 'LOGIN_CODE',
        expiresAt: { gte: new Date() },
      },
    });

    if (!tokenRecord) {
      return {
        isValid: false,
        remainingAttempts: 0,
        isMaxAttemptsReached: false,
        accountId: account.id,
      };
    }

    // Check if max attempts already reached
    if (tokenRecord.attempts >= authConstants.loginCodeMaxAttempts) {
      // Invalidate the code
      await this.db.prisma.verificationToken.delete({
        where: { id: tokenRecord.id },
      });

      return {
        isValid: false,
        remainingAttempts: 0,
        isMaxAttemptsReached: true,
        accountId: account.id,
      };
    }

    // Check if the code matches
    if (tokenRecord.token !== code) {
      // Increment attempts
      const updatedToken = await this.db.prisma.verificationToken.update({
        where: { id: tokenRecord.id },
        data: { attempts: { increment: 1 } },
      });

      const remaining = authConstants.loginCodeMaxAttempts - updatedToken.attempts;
      const isMaxReached = remaining <= 0;

      // If max attempts reached after this failure, delete the token
      if (isMaxReached) {
        await this.db.prisma.verificationToken.delete({
          where: { id: tokenRecord.id },
        });
      }

      return {
        isValid: false,
        remainingAttempts: Math.max(0, remaining),
        isMaxAttemptsReached: isMaxReached,
        accountId: account.id,
      };
    }

    // Code is valid - delete the token (single use)
    await this.db.prisma.verificationToken.delete({
      where: { id: tokenRecord.id },
    });

    return {
      isValid: true,
      remainingAttempts: authConstants.loginCodeMaxAttempts,
      isMaxAttemptsReached: false,
      accountId: account.id,
    };
  }

  async createSession({ accountId }: { accountId: string }) {
    return this.db.prisma.session.create({
      data: {
        expiresAt: dateUtils.add(new Date(), {
          minutes: authConstants.refreshTokenExpirationMinutes,
        }),
        accountId,
      },
    });
  }

  /**
   * Generate a JWT access token for a given account id.
   */
  async generateAuthenticationTokens({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await this.db.prisma.session.findUnique({
      include: {
        account: true,
      },
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session does not exist.');
    }

    const accessToken = await this.jwtService.signAsync({
      payload: {
        sub: session.id,
        accountId: session.account.id,
        role: session.account.role,
        email: session.account.email,
      },
      options: {
        expiresIn: `${authConstants.accessTokenExpirationMinutes}m`,
      },
    });

    const refreshToken = await this.jwtService.signAsync({
      payload: {
        sub: session.id,
        accountId: session.account.id,
        role: session.account.role,
        email: session.account.email,
      },
      options: {
        expiresIn: `${authConstants.refreshTokenExpirationMinutes}m`,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshAuthenticationTokens({ refreshToken }: { refreshToken: string }) {
    const jwt = await this.extractJwtPayload({ token: refreshToken }).catch(() => {
      throw new Error('Invalid or expired refresh token.');
    });

    if (!jwt.payload) {
      throw new Error('This token does not provide a payload.');
    }

    const session = await this.db.prisma.session.findUnique({
      include: {
        account: true,
      },
      where: {
        id: jwt.payload.sub,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      throw new Error('This session does not exist.');
    }

    /**
     * Refresh Token Rotation
     * We update the expiration date of the session to prevent the session from expiring
     */
    await this.db.prisma.session.update({
      where: { id: session.id },
      data: {
        expiresAt: dateUtils.add(new Date(), {
          minutes: authConstants.refreshTokenExpirationMinutes,
        }),
      },
    });

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateAuthenticationTokens({ sessionId: session.id });

    return {
      session,
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Set authentication cookies (access token and refresh token) on the response object
   */
  setAuthCookies({
    res,
    accessToken,
    refreshToken,
  }: {
    res: Response;
    accessToken: string;
    refreshToken: string;
  }): void {
    res.cookie('lunisoft_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: authConstants.accessTokenExpirationMinutes * 60 * 1000,
    });

    res.cookie('lunisoft_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: authConstants.refreshTokenExpirationMinutes * 60 * 1000,
    });
  }

  clearAuthCookies({ res }: { res: Response }): void {
    res.clearCookie('lunisoft_access_token');
    res.clearCookie('lunisoft_refresh_token');
  }
}
