import { Module } from '@nestjs/common';
import { CountryModule } from '../country/country.module';
import { SignUpHttpController } from './commands/sign-up/sign-up.http.controller';
import { SignUpService } from './commands/sign-up/sign-up.service';
import { UpdateInformationsHttpController } from './commands/update-informations/update-informations.http.controller';
import { UpdateInformationsService } from './commands/update-informations/update-informations.service';
import { GetInformationsHttpController } from './queries/get-informations/get-informations.http.controller';
import { GetInformationsQueryHandler } from './queries/get-informations/get-informations.query-handler';

const CommandHandlers = [SignUpService, UpdateInformationsService];

const QueryHandlers = [GetInformationsQueryHandler];

@Module({
  imports: [CountryModule],
  controllers: [
    SignUpHttpController,
    UpdateInformationsHttpController,
    GetInformationsHttpController,
  ],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class CustomerModule {}
