import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CountryModule } from '../country/country.module';
import { CustomerService } from './customer.service';
import { RegisterCustomerHandler } from './commands/register-customer/register-customer.handler';
import { UpdateCustomerInformationsHandler } from './commands/update-customer-informations/update-customer-informations.handler';
import { GetCustomerInformationsHandler } from './commands/get-customer-informations/get-customer-informations.handler';
import { CustomerPublicController } from './controllers/customer.public.controller';
import { CustomerAdminController } from './controllers/customer.admin.controller';
import { CustomerController } from './controllers/customer.controller';
import { AdminCreateCustomerHandler } from './commands/admin-create-customer/admin-create-customer.handler';

const CommandHandlers = [
  RegisterCustomerHandler,
  UpdateCustomerInformationsHandler,
  AdminCreateCustomerHandler,
  GetCustomerInformationsHandler,
];

@Module({
  imports: [AuthModule, CountryModule],
  controllers: [CustomerPublicController, CustomerAdminController, CustomerController],
  providers: [CustomerService, ...CommandHandlers],
})
export class CustomerModule {}
