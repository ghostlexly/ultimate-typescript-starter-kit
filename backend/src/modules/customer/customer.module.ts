import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CountryModule } from '../country/country.module';
import { CustomerService } from './customer.service';
import { RegisterCustomerController } from './commands/register-customer/register-customer.http.controller';
import { RegisterCustomerHandler } from './commands/register-customer/register-customer.handler';
import { UpdateCustomerInformationsController } from './commands/update-customer-informations/update-customer-informations.http.controller';
import { UpdateCustomerInformationsHandler } from './commands/update-customer-informations/update-customer-informations.handler';
import { GetCustomerInformationsController } from './queries/get-customer-informations/get-customer-informations.http.controller';
import { GetCustomerInformationsQueryHandler } from './queries/get-customer-informations/get-customer-informations.query-handler';

const CommandHandlers = [
  RegisterCustomerHandler,
  UpdateCustomerInformationsHandler,
];

const QueryHandlers = [GetCustomerInformationsQueryHandler];

@Module({
  imports: [AuthModule, CountryModule],
  controllers: [
    RegisterCustomerController,
    UpdateCustomerInformationsController,
    GetCustomerInformationsController,
  ],
  providers: [CustomerService, ...CommandHandlers, ...QueryHandlers],
})
export class CustomerModule {}
