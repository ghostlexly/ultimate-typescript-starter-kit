import { Roles } from '../../core/decorators/roles.decorator';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import {
  AdminCreateCustomerRequestDto,
  adminCreateCustomerRequestSchema,
} from '../commands/admin-create-customer/admin-create-customer.request.dto';
import { AdminCreateCustomerHandler } from '../commands/admin-create-customer/admin-create-customer.handler';

@Controller()
@Roles(['ADMIN'])
export class CustomerAdminController {
  constructor(private readonly adminCreateCustomerHandler: AdminCreateCustomerHandler) {}

  @Post('/admin/customers')
  @UsePipes(new ZodValidationPipe(adminCreateCustomerRequestSchema))
  async createCustomer(@Body() body: AdminCreateCustomerRequestDto['body']) {
    return this.adminCreateCustomerHandler.execute({
      email: body.email,
    });
  }
}
