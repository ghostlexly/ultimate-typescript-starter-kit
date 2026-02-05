import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CountryModule } from '../country/country.module';
import { CustomerService } from './customer.service';
import { RegisterCustomerHandler } from './commands/register-customer/register-customer.handler';
import { UpdateCustomerInformationsHandler } from './commands/update-customer-informations/update-customer-informations.handler';
import { GetCustomerInformationsHandler } from './queries/get-customer-informations/get-customer-informations.handler';
import { CustomerController } from './controllers/customer.controller';
import { CustomerAdminController } from './controllers/customer.admin.controller';
import { CustomerCustomerController } from './controllers/customer.customer.controller';
import { AdminCreateCustomerHandler } from './commands/admin-create-customer/admin-create-customer.handler';

const CommandHandlers = [
  RegisterCustomerHandler,
  UpdateCustomerInformationsHandler,
  AdminCreateCustomerHandler,
];

const QueryHandlers = [GetCustomerInformationsHandler];

@Module({
  imports: [AuthModule, CountryModule],
  controllers: [CustomerController, CustomerAdminController, CustomerCustomerController],
  providers: [CustomerService, ...CommandHandlers, ...QueryHandlers],
})
export class CustomerModule {}
