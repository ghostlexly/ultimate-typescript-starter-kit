import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';
import { CountryModule } from '../country/country.module';
import { CustomerService } from './customer.service';
import { RegisterCustomerController } from './commands/register-customer/register-customer.http.controller';
import { RegisterCustomerHandler } from './commands/register-customer/register-customer.handler';
import { RequestPasswordResetController } from './commands/request-password-reset/request-password-reset.http.controller';
import { RequestPasswordResetHandler } from './commands/request-password-reset/request-password-reset.handler';
import { ResetPasswordController } from './commands/reset-password/reset-password.http.controller';
import { ResetPasswordHandler } from './commands/reset-password/reset-password.handler';
import { UpdateCustomerInformationsController } from './commands/update-customer-informations/update-customer-informations.http.controller';
import { UpdateCustomerInformationsHandler } from './commands/update-customer-informations/update-customer-informations.handler';
import { GetCustomerInformationsController } from './queries/get-customer-informations/get-customer-informations.http.controller';
import { GetCustomerInformationsQueryHandler } from './queries/get-customer-informations/get-customer-informations.query-handler';

const CommandHandlers = [
  RegisterCustomerHandler,
  RequestPasswordResetHandler,
  ResetPasswordHandler,
  UpdateCustomerInformationsHandler,
];

const QueryHandlers = [GetCustomerInformationsQueryHandler];

@Module({
  imports: [CqrsModule, AuthModule, CountryModule],
  controllers: [
    RegisterCustomerController,
    RequestPasswordResetController,
    ResetPasswordController,
    UpdateCustomerInformationsController,
    GetCustomerInformationsController,
  ],
  providers: [CustomerService, ...CommandHandlers, ...QueryHandlers],
})
export class CustomerModule {}
