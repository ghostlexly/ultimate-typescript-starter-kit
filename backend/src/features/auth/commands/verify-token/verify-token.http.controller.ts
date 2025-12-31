import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { VerifyTokenCommand } from './verify-token.command';
import {
  verifyTokenRequestSchema,
  VerifyTokenRequestDto,
} from './verify-token.request.dto';

@Controller()
export class VerifyTokenHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/auth/verify-token')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(verifyTokenRequestSchema))
  async verifyToken(@Body() body: VerifyTokenRequestDto['body']) {
    return this.commandBus.execute(
      new VerifyTokenCommand(body.email, body.token, body.type),
    );
  }
}
