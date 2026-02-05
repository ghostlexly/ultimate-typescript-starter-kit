import { RegisterCustomerHandler } from '../commands/register-customer/register-customer.handler';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { AllowAnonymous } from '../../core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import {
  type RegisterCustomerRequestDto,
  registerCustomerRequestSchema,
} from '../commands/register-customer/register-customer.request.dto';

@Controller()
@AllowAnonymous()
export class CustomerController {
  constructor(private readonly registerCustomerHandler: RegisterCustomerHandler) {}

  @Post('/customers/signup')
  @UsePipes(new ZodValidationPipe(registerCustomerRequestSchema))
  async registerCustomer(@Body() body: RegisterCustomerRequestDto['body']) {
    return this.registerCustomerHandler.execute(body);
  }
}
