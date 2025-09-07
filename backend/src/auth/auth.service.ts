import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { DatabaseService } from 'src/common/services/database.service';
import { authConstants, jwtConstants } from './auth.constants';
import { JwtService } from '@nestjs/jwt';
import { dateUtils } from 'src/common/utils/date';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async extractJwtPayload({ token }: { token: string }): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      algorithms: ['RS256'],
      secret: Buffer.from(jwtConstants.publicKey, 'base64').toString('utf8'),
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

    const previousSession = await this.db.prisma.session.findUnique({
      where: {
        id: jwt.payload.sub,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!previousSession) {
      throw new Error('This session does not exist.');
    }

    // Refresh Token Rotation - Delete the previous session and create a new one
    await this.db.prisma.session.delete({
      where: { id: previousSession.id },
    });

    const newSession = await this.db.prisma.session.create({
      include: {
        account: true,
      },
      data: {
        expiresAt: dateUtils.add(new Date(), {
          minutes: authConstants.refreshTokenExpirationMinutes,
        }),
        accountId: previousSession.accountId,
      },
    });

    // Generate the JWT access token
    const accessToken = await this.jwtService.signAsync({
      payload: {
        sub: newSession.id,
        role: newSession.account.role,
      },
      options: {
        expiresIn: `${authConstants.accessTokenExpirationMinutes}m`,
      },
    });

    // Generate the JWT refresh token
    const newRefreshToken = await this.jwtService.signAsync({
      payload: {
        sub: newSession.id,
      },
      options: {
        expiresIn: `${authConstants.refreshTokenExpirationMinutes}m`,
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
