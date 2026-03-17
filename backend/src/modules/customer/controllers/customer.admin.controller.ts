import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../core/pipes/zod-validation.pipe';
import {
  AdminCreateCustomerRequestDto,
  adminCreateCustomerRequestSchema,
} from '../commands/admin-create-customer/admin-create-customer.request.dto';
import { AdminCreateCustomerCommand } from '../commands/admin-create-customer/admin-create-customer.command';

@Controller()
@Roles(['ADMIN'])
export class CustomerAdminController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/admin/customers')
  @UsePipes(new ZodValidationPipe(adminCreateCustomerRequestSchema))
  async createCustomer(@Body() body: AdminCreateCustomerRequestDto['body']) {
    return this.commandBus.execute(
      new AdminCreateCustomerCommand({ email: body.email }),
    );
  }
}
