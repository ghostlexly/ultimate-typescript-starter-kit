import { Module } from '@nestjs/common';
import { CountryModule } from '../country/country.module';
import { AuthModule } from '../auth/auth.module';
import { SignUpHttpController } from './commands/sign-up/sign-up.http.controller';
import { SignUpService } from './commands/sign-up/sign-up.service';
import { UpdateInformationsHttpController } from './commands/update-informations/update-informations.http.controller';
import { UpdateInformationsService } from './commands/update-informations/update-informations.service';
import { GetInformationsHttpController } from './queries/get-informations/get-informations.http.controller';
import { GetInformationsQueryHandler } from './queries/get-informations/get-informations.query-handler';
import { CUSTOMER_REPOSITORY } from './domain/ports';
import { CustomerRepository } from './infrastructure/adapters';

const CommandHandlers = [SignUpService, UpdateInformationsService];

const QueryHandlers = [GetInformationsQueryHandler];

const Repositories = [
  {
    provide: CUSTOMER_REPOSITORY,
    useClass: CustomerRepository,
  },
];

@Module({
  imports: [CountryModule, AuthModule],
  controllers: [
    SignUpHttpController,
    UpdateInformationsHttpController,
    GetInformationsHttpController,
  ],
  providers: [...CommandHandlers, ...QueryHandlers, ...Repositories],
})
export class CustomerModule {}
