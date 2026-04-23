import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Roles } from '../../../core/decorators/roles.decorator';
import { AdminCreateCustomerRequest } from '../dtos/admin-create-customer.request';
import { AdminCreateCustomerCommand } from '../commands/admin-create-customer/admin-create-customer.command';

@Controller('admin/customers')
@Roles(['ADMIN'])
export class CustomerAdminController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createCustomer(@Body() body: AdminCreateCustomerRequest) {
    return this.commandBus.execute(new AdminCreateCustomerCommand({ email: body.email }));
  }
}
