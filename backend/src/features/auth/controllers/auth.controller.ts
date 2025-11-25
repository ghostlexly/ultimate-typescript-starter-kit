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
import type { Request, Response } from 'express';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { DatabaseService } from 'src/features/application/services/database.service';
import { Account } from 'src/generated/prisma/client';
import { AuthService } from '../auth.service';
import { OAuthRedirectExceptionFilter } from '../filters/oauth-redirect.filter';
import type {
  AuthRefreshTokenDto,
  AuthSigninDto,
} from '../validators/auth.validators';
import {
  authRefreshTokenSchema,
  authSigninSchema,
} from '../validators/auth.validators';

@Controller()
export class AuthController {
  constructor(
    private db: DatabaseService,
    private authService: AuthService,
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
    let account: Account | null = null;
    if (body.role === 'ADMIN') {
      account = await this.db.prisma.account.findFirst({
        where: {
          role: 'ADMIN',
          email: {
            contains: body.email,
            mode: 'insensitive',
          },
        },
      });
    } else if (body.role === 'CUSTOMER') {
      account = await this.db.prisma.account.findFirst({
        where: {
          role: 'CUSTOMER',
          email: {
            contains: body.email,
            mode: 'insensitive',
          },
        },
      });
    }

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

  @Get('/auth/google/customer')
  @AllowAnonymous()
  @UseGuards(AuthGuard('google-customer'))
  @UseFilters(OAuthRedirectExceptionFilter)
  async googleAuthCustomer() {
    // This route initiates the Google OAuth flow for customers
  }

  @Get('/auth/google/customer/callback')
  @AllowAnonymous()
  @UseGuards(AuthGuard('google-customer'))
  @UseFilters(OAuthRedirectExceptionFilter)
  async googleAuthRedirectCustomer(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;

    if (!user) {
      // Redirect to sign-in page with error message
      return res.redirect(
        `${process.env.APP_BASE_URL}/customer-area/signin?error=FAILED_TO_AUTHENTICATE_GOOGLE`,
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
    return res.redirect(`${process.env.APP_BASE_URL}/customer-area`);
  }

  @Get('/auth/google/admin')
  @AllowAnonymous()
  @UseGuards(AuthGuard('google-admin'))
  @UseFilters(OAuthRedirectExceptionFilter)
  async googleAuthAdmin() {
    // This route initiates the Google OAuth flow for admins
  }

  @Get('/auth/google/admin/callback')
  @AllowAnonymous()
  @UseGuards(AuthGuard('google-admin'))
  @UseFilters(OAuthRedirectExceptionFilter)
  async googleAuthAdminRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;

    if (!user) {
      // Redirect to sign-in page with error message
      return res.redirect(
        `${process.env.APP_BASE_URL}/admin-area/signin?error=FAILED_TO_AUTHENTICATE_GOOGLE`,
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
    return res.redirect(`${process.env.APP_BASE_URL}/admin-area`);
  }
}
