import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { ResetPasswordCommand } from './reset-password.command';
import {
  resetPasswordRequestSchema,
  type ResetPasswordRequestDto,
} from './reset-password.request.dto';

@Controller()
export class ResetPasswordController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/auth/reset-password')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(resetPasswordRequestSchema))
  async resetPassword(@Body() body: ResetPasswordRequestDto['body']) {
    return this.commandBus.execute(new ResetPasswordCommand({ data: body }));
  }
}
