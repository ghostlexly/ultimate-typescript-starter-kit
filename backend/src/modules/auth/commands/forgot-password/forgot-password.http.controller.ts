import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/modules/core/pipes/zod-validation.pipe';
import { ForgotPasswordCommand } from './forgot-password.command';
import {
  type ForgotPasswordRequestDto,
  forgotPasswordRequestSchema,
} from './forgot-password.request.dto';

@Controller()
export class ForgotPasswordController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/auth/forgot-password')
  @AllowAnonymous()
  @Throttle({ long: { limit: 5 } })
  @UsePipes(new ZodValidationPipe(forgotPasswordRequestSchema))
  async forgotPassword(@Body() body: ForgotPasswordRequestDto['body']) {
    return this.commandBus.execute(
      new ForgotPasswordCommand({ email: body.email }),
    );
  }
}
