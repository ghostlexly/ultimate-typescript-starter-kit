import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AllowAnonymous } from '../../../core/decorators/allow-anonymous.decorator';
import { OAuthRedirectExceptionFilter } from '../../../core/filters/oauth-redirect.filter';
import { AuthService } from '../auth.service';
import { SendCodeCommand } from '../commands/send-code/send-code.command';
import { VerifyCodeCommand } from '../commands/verify-code/verify-code.command';
import { RefreshTokenCommand } from '../commands/refresh-token/refresh-token.command';
import { SendCodeRequest } from '../dtos/send-code.request';
import { VerifyCodeRequest } from '../dtos/verify-code.request';
import { RefreshTokenRequest } from '../dtos/refresh-token.request';
import { AuthenticationPrincipal } from '../../../core/decorators/authentication-principal.decorator';
import type { UserPrincipal } from '../../../core/types/request';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly commandBus: CommandBus,
  ) {}

  /**
   * Send a 4-digit login code to the user's email.
   * Security: 60-second cooldown between sends, throttled to 10 requests/minute.
   */
  @Post('send-code')
  @AllowAnonymous()
  @Throttle({ default: { limit: 10 } })
  async sendCode(@Body() body: SendCodeRequest) {
    return this.commandBus.execute(new SendCodeCommand(body.email));
  }

  /**
   * Verify the 4-digit login code and authenticate the user.
   * Security: max 5 attempts per code, throttled to 5 requests/minute.
   */
  @Post('verify-code')
  @AllowAnonymous()
  @Throttle({ default: { limit: 5 } })
  async verifyCode(
    @Res({ passthrough: true }) res: Response,
    @Body() body: VerifyCodeRequest,
  ) {
    const { accessToken, refreshToken, role } = await this.commandBus.execute(
      new VerifyCodeCommand(body.email, body.code),
    );

    this.authService.setAuthCookies({
      res,
      accessToken,
      refreshToken,
    });

    return {
      role,
      accessToken,
      refreshToken,
    };
  }

  @Get('google')
  @AllowAnonymous()
  @UseGuards(AuthGuard('google'))
  @UseFilters(OAuthRedirectExceptionFilter)
  async googleAuth() {
    // This route initiates the Google OAuth flow for customers
  }

  @Get('google/callback')
  @AllowAnonymous()
  @UseGuards(AuthGuard('google'))
  @UseFilters(OAuthRedirectExceptionFilter)
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;

    if (!user) {
      return res.redirect(
        `${process.env.APP_BASE_URL}/auth/signin?error=FAILED_TO_AUTHENTICATE_GOOGLE`,
      );
    }

    const { accessToken, refreshToken } =
      await this.authService.generateAuthenticationTokens({
        sessionId: user.sessionId,
      });

    this.authService.setAuthCookies({
      res,
      accessToken,
      refreshToken,
    });

    switch (user.role) {
      case 'ADMIN':
        return res.redirect(`${process.env.APP_BASE_URL}/admin-area`);
      case 'CUSTOMER':
        return res.redirect(`${process.env.APP_BASE_URL}/`);
    }
  }

  @Post('refresh')
  @AllowAnonymous()
  @Throttle({ default: { limit: 50 } })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RefreshTokenRequest,
  ) {
    const refreshToken =
      body?.refreshToken ?? (req.cookies?.lunisoft_refresh_token as string | undefined);

    if (!refreshToken) {
      throw new BadRequestException(
        'Refresh token not found. Please set it in the body parameter or in your cookies.',
      );
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.commandBus.execute(
      new RefreshTokenCommand(refreshToken),
    );

    this.authService.setAuthCookies({
      res,
      accessToken,
      refreshToken: newRefreshToken,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  @Get('me')
  getMe(@AuthenticationPrincipal() user: UserPrincipal) {
    return {
      accountId: user.accountId,
      email: user.email,
      role: user.role,
    };
  }
}
