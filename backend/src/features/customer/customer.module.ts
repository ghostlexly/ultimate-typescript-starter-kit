import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './controllers/customer.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CustomerService],
  controllers: [CustomerController],
})
export class CustomerModule {}
