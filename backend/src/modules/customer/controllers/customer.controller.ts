import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AllowAnonymous } from '../../../core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from '../../../core/pipes/zod-validation.pipe';
import {
  type RegisterCustomerRequestDto,
  registerCustomerRequestSchema,
} from '../commands/register-customer/register-customer.request.dto';
import { RegisterCustomerCommand } from '../commands/register-customer/register-customer.command';

@Controller()
@AllowAnonymous()
export class CustomerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/customers/signup')
  @UsePipes(new ZodValidationPipe(registerCustomerRequestSchema))
  async registerCustomer(@Body() body: RegisterCustomerRequestDto['body']) {
    return this.commandBus.execute(
      new RegisterCustomerCommand(body),
    );
  }
}
