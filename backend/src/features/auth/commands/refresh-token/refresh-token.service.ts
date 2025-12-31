import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenCommand } from './refresh-token.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { dateUtils } from 'src/core/utils/date';
import { authConstants } from '../../auth.constants';

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenService
  implements ICommandHandler<RefreshTokenCommand, RefreshTokenResult>
{
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

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    // Verify the refresh token
    let jwt: { payload?: { sub?: string } };

    try {
      jwt = await this.jwtService.verifyAsync(command.refreshToken, {
        algorithms: ['RS256'],
        secret: this.jwtPublicKey,
      });
    } catch {
      throw new HttpException(
        { message: 'Invalid or expired refresh token.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!jwt?.payload?.sub) {
      throw new HttpException(
        { message: 'This token does not provide a payload.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Find session with account
    const session = await this.db.prisma.session.findUnique({
      where: {
        id: jwt.payload.sub,
        expiresAt: { gt: new Date() },
      },
      include: { account: true },
    });

    if (!session) {
      throw new HttpException(
        { message: 'This session does not exist.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Extend session (Refresh Token Rotation)
    await this.db.prisma.session.update({
      where: { id: session.id },
      data: {
        expiresAt: dateUtils.add(new Date(), {
          minutes: authConstants.refreshTokenExpirationMinutes,
        }),
      },
    });

    // Generate new tokens
    const payload = {
      sub: session.id,
      accountId: session.account.id,
      role: session.account.role,
      email: session.account.email,
    };

    const accessToken = await this.jwtService.signAsync({
      payload,
      options: { expiresIn: `${authConstants.accessTokenExpirationMinutes}m` },
    });

    const refreshToken = await this.jwtService.signAsync({
      payload,
      options: { expiresIn: `${authConstants.refreshTokenExpirationMinutes}m` },
    });

    return { accessToken, refreshToken };
  }
}
