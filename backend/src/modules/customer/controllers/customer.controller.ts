import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AllowAnonymous } from '../../../core/decorators/allow-anonymous.decorator';
import { RegisterCustomerRequest } from '../dtos/register-customer.request';
import { RegisterCustomerCommand } from '../commands/register-customer/register-customer.command';

@Controller()
@AllowAnonymous()
export class CustomerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/customers/signup')
  async registerCustomer(@Body() body: RegisterCustomerRequest) {
    return this.commandBus.execute(new RegisterCustomerCommand(body));
  }
}
