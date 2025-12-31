import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { SignUpCommand } from './sign-up.command';
import { signUpRequestSchema, type SignUpRequestDto } from './sign-up.request.dto';

@Controller()
export class SignUpHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/customers/signup')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(signUpRequestSchema))
  async signUp(@Body() body: SignUpRequestDto['body']) {
    return this.commandBus.execute(
      new SignUpCommand(body.email, body.password),
    );
  }
}
