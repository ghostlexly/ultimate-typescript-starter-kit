import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import crypto from 'crypto';
import type { Request, Response } from 'express';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { OAuthRedirectExceptionFilter } from 'src/core/filters/oauth-redirect.filter';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { dateUtils } from 'src/core/utils/date';
import { BrevoService } from 'src/features/application/services/brevo.service';
import { DatabaseService } from 'src/features/application/services/database.service';
import { Account } from 'src/generated/prisma/client';
import { AuthService } from '../auth.service';
import type {
  AuthForgotPasswordDto,
  AuthRefreshTokenDto,
  AuthResetPasswordDto,
  AuthSigninDto,
  AuthVerifyTokenDto,
} from '../validators/auth.validators';
import {
  authForgotPasswordSchema,
  authRefreshTokenSchema,
  authResetPasswordSchema,
  authSigninSchema,
  authVerifyTokenSchema,
} from '../validators/auth.validators';

@Controller()
export class AuthController {
  constructor(
    private db: DatabaseService,
    private authService: AuthService,
    private brevoService: BrevoService,
  ) {}

  @Post('/auth/signin')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(authSigninSchema))
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() body: AuthSigninDto['body'],
  ) {
    // Verify if user exists
    const account: Account | null = await this.db.prisma.account.findFirst({
      where: {
        email: {
          contains: body.email,
          mode: 'insensitive',
        },
      },
    });

    if (!account) {
      // When user doesn't exist, still hash a fake password to prevent timing-based account enumeration
      await this.authService.comparePassword({
        password: body.password,
        hashedPassword: '$2a$10$fakeHashToPreventTimingAttacks',
      });

      throw new HttpException(
        {
          message: 'Mot de passe ou e-mail incorrect.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!account.password) {
      throw new HttpException(
        {
          message:
            'You have previously signed up with another service like Google, please use the appropriate login method for this account.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash given password and compare it to the stored hash
    const validPassword = await this.authService.comparePassword({
      password: body.password,
      hashedPassword: account.password,
    });

    if (!validPassword) {
      throw new HttpException(
        {
          message: 'Mot de passe ou e-mail incorrect.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate an access token
    const { accessToken, refreshToken } =
      await this.authService.generateAuthenticationTokens({
        accountId: account.id,
      });

    // Set authentication cookies
    this.authService.setAuthCookies({
      res,
      accessToken,
      refreshToken,
    });

    return {
      role: account.role,
      accessToken,
      refreshToken,
    };
  }

  @Post('/auth/refresh')
  @AllowAnonymous()
  @Throttle({ long: { limit: 50 } })
  @UsePipes(new ZodValidationPipe(authRefreshTokenSchema))
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: AuthRefreshTokenDto['body'],
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
    const { accessToken, refreshToken } = await this.authService
      .refreshAuthenticationTokens({
        refreshToken: previousRefreshToken,
      })
      .catch((error) => {
        throw new HttpException(
          {
            message: error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });

    // Set authentication cookies
    this.authService.setAuthCookies({
      res,
      accessToken,
      refreshToken,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  @Get('/auth/me')
  getMe(@Req() req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.role === 'CUSTOMER') {
      return {
        id: user.customer.id,
        email: user.email,
        role: user.role,
      };
    } else if (user.role === 'ADMIN') {
      return {
        id: user.admin.id,
        email: user.email,
        role: user.role,
      };
    } else {
      throw new HttpException('Invalid role.', HttpStatus.BAD_REQUEST);
    }
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
        `${process.env.APP_BASE_URL}/signin?error=FAILED_TO_AUTHENTICATE_GOOGLE`,
      );
    }

    // Generate authentication tokens
    const { accessToken, refreshToken } =
      await this.authService.generateAuthenticationTokens({
        accountId: user.id,
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

  @Post('/auth/forgot-password')
  @AllowAnonymous()
  @Throttle({ long: { limit: 5 } })
  @UsePipes(new ZodValidationPipe(authForgotPasswordSchema))
  async forgotPassword(@Body() body: AuthForgotPasswordDto['body']) {
    const account: Account | null = await this.db.prisma.account.findFirst({
      where: {
        email: {
          contains: body.email,
          mode: 'insensitive',
        },
      },
    });

    if (!account) {
      throw new HttpException(
        {
          message: 'Account not found.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate a random password reset token
    const passwordResetToken = crypto.randomInt(100000, 999999).toString();

    // Store the token in the database (e.g., in a password_reset_tokens table)
    await this.db.prisma.verificationToken.create({
      data: {
        type: 'PASSWORD_RESET',
        token: passwordResetToken,
        accountId: account.id,
        expiresAt: dateUtils.add(new Date(), { hours: 6 }),
      },
    });

    // Send the password reset email
    // await this.brevoService.sendEmailTemplate({
    //   toEmail: account.email,
    //   templateId: 275,
    //   subject: 'Demande de réinitialisation de votre mot de passe',
    //   templateParams: {
    //     passwordResetToken,
    //   },
    // });

    return {
      message: 'Password reset email sent successfully.',
    };
  }

  @Post('/auth/verify-token')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(authVerifyTokenSchema))
  async verifyToken(@Body() body: AuthVerifyTokenDto['body']) {
    const token = await this.authService.verifyVerificationToken({
      type: body.type,
      token: body.token,
      email: body.email,
    });

    if (!token) {
      throw new HttpException(
        {
          message: 'This token is not valid or has expired.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Token is valid.',
    };
  }

  @Post('/auth/reset-password')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(authResetPasswordSchema))
  async resetPassword(@Body() body: AuthResetPasswordDto['body']) {
    const token = await this.authService.verifyVerificationToken({
      type: 'PASSWORD_RESET',
      token: body.token,
      email: body.email,
    });

    if (!token) {
      throw new HttpException(
        {
          message: 'This token is not valid or expired.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const account = await this.db.prisma.account.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!account) {
      throw new HttpException(
        {
          message: 'Account not found.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.authService.hashPassword({
      password: body.password,
    });

    // Update the account password
    await this.db.prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Delete the verification token
    await this.db.prisma.verificationToken.deleteMany({
      where: {
        accountId: account.id,
        type: 'PASSWORD_RESET',
      },
    });

    return {
      message: 'Password reset successfully.',
    };
  }
}
