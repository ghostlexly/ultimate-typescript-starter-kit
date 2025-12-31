import { Controller, Get, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { OAuthRedirectExceptionFilter } from 'src/core/filters/oauth-redirect.filter';
import { authConstants } from '../../auth.constants';

@Controller()
export class GoogleAuthHttpController {
  constructor(private readonly jwtService: JwtService) {}

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
      return res.redirect(
        `${process.env.APP_BASE_URL}/auth/signin?error=FAILED_TO_AUTHENTICATE_GOOGLE`,
      );
    }

    // Generate authentication tokens
    const payload = {
      sub: user.sessionId,
      accountId: user.accountId,
      role: user.role,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync({
      payload,
      options: { expiresIn: `${authConstants.accessTokenExpirationMinutes}m` },
    });

    const refreshToken = await this.jwtService.signAsync({
      payload,
      options: { expiresIn: `${authConstants.refreshTokenExpirationMinutes}m` },
    });

    // Set authentication cookies
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

    // Redirect to frontend
    switch (user.role) {
      case 'ADMIN':
        return res.redirect(`${process.env.APP_BASE_URL}/admin-area`);
      case 'CUSTOMER':
        return res.redirect(`${process.env.APP_BASE_URL}/`);
    }
  }
}
