import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { RefreshTokenCommand } from './refresh-token.command';
import {
  refreshTokenRequestSchema,
  type RefreshTokenRequestDto,
} from './refresh-token.request.dto';

@Controller()
export class RefreshTokenController {
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
    const refreshToken =
      body?.refreshToken ??
      (req.cookies?.lunisoft_refresh_token as string | undefined);

    if (!refreshToken) {
      throw new HttpException(
        {
          message:
            'Refresh token not found. Please set it in the body parameter or in your cookies.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.commandBus.execute(
      new RefreshTokenCommand({ data: { refreshToken }, res }),
    );
  }
}
