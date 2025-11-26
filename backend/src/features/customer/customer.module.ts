import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './controllers/customer.controller';
import { AuthModule } from '../auth/auth.module';
import { CustomerCustomerController } from './controllers/customer.customer.controller';
import { CountryModule } from '../country/country.module';

@Module({
  imports: [AuthModule, CountryModule],
  providers: [CustomerService],
  controllers: [CustomerController, CustomerCustomerController],
})
export class CustomerModule {}
