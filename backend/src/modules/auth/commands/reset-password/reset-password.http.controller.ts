import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/modules/core/pipes/zod-validation.pipe';
import {
  resetPasswordRequestSchema,
  type ResetPasswordRequestDto,
} from './reset-password.request.dto';
import { ResetPasswordHandler } from './reset-password.handler';

@Controller()
export class ResetPasswordController {
  constructor(private readonly handler: ResetPasswordHandler) {}

  @Post('/auth/reset-password')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(resetPasswordRequestSchema))
  async resetPassword(@Body() body: ResetPasswordRequestDto['body']) {
    return this.handler.execute(body);
  }
}
