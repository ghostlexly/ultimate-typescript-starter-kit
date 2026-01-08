import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { RequestPasswordResetCommand } from './request-password-reset.command';
import {
  requestPasswordResetRequestSchema,
  type RequestPasswordResetRequestDto,
} from './request-password-reset.request.dto';

@Controller()
export class RequestPasswordResetController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/customers/request-password-reset')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(requestPasswordResetRequestSchema))
  async requestPasswordReset(
    @Body() body: RequestPasswordResetRequestDto['body'],
  ) {
    return this.commandBus.execute(
      new RequestPasswordResetCommand({ email: body.email }),
    );
  }
}
