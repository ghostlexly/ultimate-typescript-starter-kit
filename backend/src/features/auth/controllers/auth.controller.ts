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
  UsePipes,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { DatabaseService } from 'src/features/application/services/database.service';
import { Admin, Customer } from 'src/generated/prisma/client';
import { authConstants } from '../auth.constants';
import { AuthService } from '../auth.service';
import type {
  AuthRefreshTokenDto,
  AuthSigninDto,
} from '../validators/auth.validators';
import {
  authRefreshTokenSchema,
  authSigninSchema,
} from '../validators/auth.validators';

@Controller('auth')
export class AuthController {
  constructor(
    private db: DatabaseService,
    private authService: AuthService,
  ) {}

  @Post('signin')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(authSigninSchema))
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() body: AuthSigninDto['body'],
  ) {
    // Verify if user exists
    let user: Admin | Customer | null = null;
    if (body.role === 'ADMIN') {
      user = await this.db.prisma.admin.findFirst({
        where: {
          email: {
            contains: body.email,
            mode: 'insensitive',
          },
        },
      });
    } else if (body.role === 'CUSTOMER') {
      user = await this.db.prisma.customer.findFirst({
        where: {
          email: {
            contains: body.email,
            mode: 'insensitive',
          },
        },
      });
    }

    if (!user) {
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

    if (!user.password) {
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
      hashedPassword: user.password,
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
        accountId: user.accountId,
      });

    res.cookie('lunisoft_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // ✅ CSRF protection (lax for SSR compatibility)
      path: '/',
      maxAge: authConstants.accessTokenExpirationMinutes * 60 * 1000,
    });

    res.cookie('lunisoft_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // ✅ CSRF protection (lax for SSR compatibility)
      path: '/',
      maxAge: authConstants.refreshTokenExpirationMinutes * 60 * 1000,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('refresh')
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

    res.cookie('lunisoft_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // ✅ CSRF protection (lax for SSR compatibility)
      path: '/',
      maxAge: authConstants.accessTokenExpirationMinutes * 60 * 1000,
    });

    res.cookie('lunisoft_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // ✅ CSRF protection (lax for SSR compatibility)
      path: '/',
      maxAge: authConstants.refreshTokenExpirationMinutes * 60 * 1000,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  @Get('me')
  getMe(@Req() req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.role === 'CUSTOMER') {
      return {
        id: user.customer.id,
        email: user.customer.email,
        role: user.role,
      };
    } else if (user.role === 'ADMIN') {
      return {
        id: user.admin.id,
        email: user.admin.email,
        role: user.role,
      };
    } else {
      throw new HttpException('Invalid role.', HttpStatus.BAD_REQUEST);
    }
  }
}
