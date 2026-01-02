import { Body, Controller, Post, Res, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { SignInCommand } from './sign-in.command';
import {
  signInRequestSchema,
  type SignInRequestDto,
} from './sign-in.request.dto';

@Controller()
export class SignInController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/auth/signin')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(signInRequestSchema))
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() body: SignInRequestDto['body'],
  ) {
    return this.commandBus.execute(
      new SignInCommand({ email: body.email, password: body.password, res }),
    );
  }
}
