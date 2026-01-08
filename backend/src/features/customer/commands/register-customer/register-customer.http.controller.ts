import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { RegisterCustomerCommand } from './register-customer.command';
import {
  registerCustomerRequestSchema,
  type RegisterCustomerRequestDto,
} from './register-customer.request.dto';

@Controller()
export class RegisterCustomerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/customers/signup')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(registerCustomerRequestSchema))
  async registerCustomer(@Body() body: RegisterCustomerRequestDto['body']) {
    return this.commandBus.execute(
      new RegisterCustomerCommand({
        email: body.email,
        password: body.password,
        country: body.country,
      }),
    );
  }
}
