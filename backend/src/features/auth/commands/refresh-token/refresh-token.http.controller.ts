import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { authConstants } from '../../auth.constants';
import { RefreshTokenCommand } from './refresh-token.command';
import {
  refreshTokenRequestSchema,
  RefreshTokenRequestDto,
} from './refresh-token.request.dto';

@Controller()
export class RefreshTokenHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/auth/refresh')
  @AllowAnonymous()
  @Throttle({ long: { limit: 50 } })
  @UsePipes(new ZodValidationPipe(refreshTokenRequestSchema))
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RefreshTokenRequestDto['body'],
  ) {
    const previousRefreshToken =
      body?.refreshToken ?? req.cookies?.lunisoft_refresh_token;

    if (!previousRefreshToken) {
      throw new HttpException(
        {
          message:
            'Refresh token not found. Please set it in the body parameter or in your cookies.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.commandBus.execute(
      new RefreshTokenCommand(previousRefreshToken),
    );

    // Set authentication cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
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
}
