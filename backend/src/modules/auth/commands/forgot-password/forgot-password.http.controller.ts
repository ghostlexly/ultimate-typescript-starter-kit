import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/modules/core/pipes/zod-validation.pipe';
import {
  type ForgotPasswordRequestDto,
  forgotPasswordRequestSchema,
} from './forgot-password.request.dto';
import { ForgotPasswordHandler } from './forgot-password.handler';

@Controller()
export class ForgotPasswordController {
  constructor(private readonly handler: ForgotPasswordHandler) {}

  @Post('/auth/forgot-password')
  @AllowAnonymous()
  @Throttle({ long: { limit: 5 } })
  @UsePipes(new ZodValidationPipe(forgotPasswordRequestSchema))
  async forgotPassword(@Body() body: ForgotPasswordRequestDto['body']) {
    return this.handler.execute({ email: body.email });
  }
}
