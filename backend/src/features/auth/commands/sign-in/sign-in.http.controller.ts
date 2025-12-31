import { Body, Controller, Post, Res, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { authConstants } from '../../auth.constants';
import { SignInCommand } from './sign-in.command';
import { signInRequestSchema, SignInRequestDto } from './sign-in.request.dto';

@Controller()
export class SignInHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/auth/signin')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(signInRequestSchema))
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() body: SignInRequestDto['body'],
  ) {
    const result = await this.commandBus.execute(
      new SignInCommand(body.email, body.password),
    );

    // Set authentication cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return {
      role: result.role,
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
