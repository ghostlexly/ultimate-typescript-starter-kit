import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/modules/core/pipes/zod-validation.pipe';
import { VerifyTokenCommand } from './verify-token.command';
import {
  type VerifyTokenRequestDto,
  verifyTokenRequestSchema,
} from './verify-token.request.dto';

@Controller()
export class VerifyTokenController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/auth/verify-token')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  @UsePipes(new ZodValidationPipe(verifyTokenRequestSchema))
  async verifyToken(@Body() body: VerifyTokenRequestDto['body']) {
    const isTokenValid = this.commandBus.execute(new VerifyTokenCommand(body));

    if (!isTokenValid) {
      throw new HttpException(
        {
          message: 'This token is not valid or has expired.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Token is valid.',
    };
  }
}
