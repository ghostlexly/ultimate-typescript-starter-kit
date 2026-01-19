import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/modules/core/pipes/zod-validation.pipe';
import { ResetPasswordCommand } from './reset-password.command';
import {
  resetPasswordRequestSchema,
  type ResetPasswordRequestDto,
} from './reset-password.request.dto';

@Controller()
export class ResetPasswordController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/customers/reset-password')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(resetPasswordRequestSchema))
  async resetPassword(@Body() body: ResetPasswordRequestDto['body']) {
    return this.commandBus.execute(new ResetPasswordCommand(body));
  }
}
