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
  UsePipes,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AllowAnonymous } from '../../core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { OAuthRedirectExceptionFilter } from '../../core/filters/oauth-redirect.filter';
import { AuthService } from '../auth.service';
import { SignInHandler } from '../commands/sign-in/sign-in.handler';
import { RefreshTokenHandler } from '../commands/refresh-token/refresh-token.handler';
import { ForgotPasswordHandler } from '../commands/forgot-password/forgot-password.handler';
import { VerifyTokenHandler } from '../commands/verify-token/verify-token.handler';
import { ResetPasswordHandler } from '../commands/reset-password/reset-password.handler';
import {
  type SignInRequestDto,
  signInRequestSchema,
} from '../commands/sign-in/sign-in.request.dto';
import {
  type RefreshTokenRequestDto,
  refreshTokenRequestSchema,
} from '../commands/refresh-token/refresh-token.request.dto';
import {
  type ForgotPasswordRequestDto,
  forgotPasswordRequestSchema,
} from '../commands/forgot-password/forgot-password.request.dto';
import {
  type VerifyTokenRequestDto,
  verifyTokenRequestSchema,
} from '../commands/verify-token/verify-token.request.dto';
import {
  type ResetPasswordRequestDto,
  resetPasswordRequestSchema,
} from '../commands/reset-password/reset-password.request.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../../core/types/request';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly signInHandler: SignInHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly forgotPasswordHandler: ForgotPasswordHandler,
    private readonly verifyTokenHandler: VerifyTokenHandler,
    private readonly resetPasswordHandler: ResetPasswordHandler,
  ) {}

  @Post('/auth/signin')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(signInRequestSchema))
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() body: SignInRequestDto['body'],
  ) {
    const { accessToken, refreshToken, role } = await this.signInHandler.execute({
      ...body,
    });

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

  @Post('/auth/refresh')
  @AllowAnonymous()
  @Throttle({ long: { limit: 50 } })
  @UsePipes(new ZodValidationPipe(refreshTokenRequestSchema))
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RefreshTokenRequestDto['body'],
  ) {
    const refreshToken =
      body?.refreshToken ?? (req.cookies?.lunisoft_refresh_token as string | undefined);

    if (!refreshToken) {
      throw new BadRequestException(
        'Refresh token not found. Please set it in the body parameter or in your cookies.',
      );
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.refreshTokenHandler.execute({ refreshToken });

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

  @Post('/auth/forgot-password')
  @AllowAnonymous()
  @Throttle({ long: { limit: 5 } })
  @UsePipes(new ZodValidationPipe(forgotPasswordRequestSchema))
  async forgotPassword(@Body() body: ForgotPasswordRequestDto['body']) {
    return this.forgotPasswordHandler.execute({ email: body.email });
  }

  @Post('/auth/verify-token')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(verifyTokenRequestSchema))
  async verifyToken(@Body() body: VerifyTokenRequestDto['body']) {
    const isTokenValid = await this.verifyTokenHandler.execute(body);

    if (!isTokenValid) {
      throw new BadRequestException('This token is not valid or has expired.');
    }

    return {
      message: 'Token is valid.',
    };
  }

  @Post('/auth/reset-password')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(resetPasswordRequestSchema))
  async resetPassword(@Body() body: ResetPasswordRequestDto['body']) {
    return this.resetPasswordHandler.execute(body);
  }

  @Get('/auth/me')
  getMe(@CurrentUser() user: RequestUser) {
    return {
      accountId: user.accountId,
      email: user.email,
      role: user.role,
    };
  }
}
