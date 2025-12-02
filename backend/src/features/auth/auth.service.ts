import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { Response } from 'express';
import { dateUtils } from 'src/core/utils/date';
import { DatabaseService } from 'src/features/application/services/database.service';
import { authConstants } from './auth.constants';

@Injectable()
export class AuthService {
  private jwtPublicKey: string;

  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
   *  Method to generate a secure unique token
   */
  generateUniqueToken({ length = 32 }: { length?: number } = {}) {
    const result = crypto.randomBytes(length);
    return result.toString('hex');
  }

  async hashPassword({ password }: { password: string }) {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Generate a JWT access token for a given account id.
   */
  async generateAuthenticationTokens({
    accountId,
  }: {
    accountId: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    // Get the user
    const account = await this.db.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account does not exist.');
    }

    // Create a new session
    const session = await this.db.prisma.session.create({
      data: {
        expiresAt: dateUtils.add(new Date(), {
          minutes: authConstants.refreshTokenExpirationMinutes,
        }),
        accountId,
      },
    });

    // Generate the JWT access token
    const accessToken = await this.jwtService.signAsync({
      payload: {
        sub: session.id,
        role: account.role,
      },
      options: {
        expiresIn: `${authConstants.accessTokenExpirationMinutes}m`,
      },
    });

    // Generate the JWT refresh token
    const refreshToken = await this.jwtService.signAsync({
      payload: {
        sub: session.id,
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

  async refreshAuthenticationTokens({
    refreshToken,
  }: {
    refreshToken: string;
  }) {
    const jwt = await this.extractJwtPayload({ token: refreshToken }).catch(
      () => {
        throw new Error('Invalid or expired refresh token.');
      },
    );

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

    // Generate the JWT access token
    const accessToken = await this.jwtService.signAsync({
      payload: {
        sub: session.id,
        role: session.account.role,
      },
      options: {
        expiresIn: `${authConstants.accessTokenExpirationMinutes}m`,
      },
    });

    // Generate the JWT refresh token
    const newRefreshToken = await this.jwtService.signAsync({
      payload: {
        sub: session.id,
      },
      options: {
        expiresIn: `${authConstants.refreshTokenExpirationMinutes}m`,
      },
    });

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
