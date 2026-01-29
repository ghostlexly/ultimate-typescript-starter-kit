import {
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
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/modules/core/pipes/zod-validation.pipe';
import { SignInCommand } from './sign-in.command';
import { type SignInRequestDto, signInRequestSchema } from './sign-in.request.dto';
import { AuthGuard } from '@nestjs/passport';
import { OAuthRedirectExceptionFilter } from 'src/modules/core/filters/oauth-redirect.filter';
import { AuthService } from '../../auth.service';

@Controller()
export class SignInController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  @Post('/auth/signin')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(signInRequestSchema))
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() body: SignInRequestDto['body'],
  ) {
    const { accessToken, refreshToken, role } = await this.commandBus.execute(
      new SignInCommand({ ...body }),
    );

    // Set authentication cookies
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
