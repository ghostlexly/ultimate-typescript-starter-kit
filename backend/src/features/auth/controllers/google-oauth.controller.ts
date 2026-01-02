import {
  Controller,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { OAuthRedirectExceptionFilter } from 'src/core/filters/oauth-redirect.filter';
import { AuthService } from '../auth.service';

@Controller()
export class GoogleOAuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/auth/google')
  @AllowAnonymous()
  @UseGuards(AuthGuard('google'))
  @UseFilters(OAuthRedirectExceptionFilter)
  async googleAuth() {
    // This route initiates the Google OAuth flow for customers
  }

  @Get('/auth/google/callback')
  @AllowAnonymous()
  @UseGuards(AuthGuard('google'))
  @UseFilters(OAuthRedirectExceptionFilter)
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;

    if (!user) {
      // Redirect to sign-in page with error message
      return res.redirect(
        `${process.env.APP_BASE_URL}/auth/signin?error=FAILED_TO_AUTHENTICATE_GOOGLE`,
      );
    }

    // Generate authentication tokens
    const { accessToken, refreshToken } =
      await this.authService.generateAuthenticationTokens({
        sessionId: user.sessionId,
      });

    // Set authentication cookies
    this.authService.setAuthCookies({
      res,
      accessToken,
      refreshToken,
    });

    // Redirect to frontend
    switch (user.role) {
      case 'ADMIN':
        return res.redirect(`${process.env.APP_BASE_URL}/admin-area`);
      case 'CUSTOMER':
        return res.redirect(`${process.env.APP_BASE_URL}/`);
    }
  }
}
