import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/modules/core/pipes/zod-validation.pipe';
import {
  registerCustomerRequestSchema,
  type RegisterCustomerRequestDto,
} from './register-customer.request.dto';
import { RegisterCustomerHandler } from './register-customer.handler';

@Controller()
export class RegisterCustomerController {
  constructor(private readonly handler: RegisterCustomerHandler) {}

  @Post('/customers/signup')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(registerCustomerRequestSchema))
  async registerCustomer(@Body() body: RegisterCustomerRequestDto['body']) {
    return this.handler.execute(body);
  }
}
