import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CountryService } from './country.service';
import { GetAllCountriesController } from './queries/get-all-countries/get-all-countries.http.controller';
import { GetAllCountriesQueryHandler } from './queries/get-all-countries/get-all-countries.query-handler';

const QueryHandlers = [GetAllCountriesQueryHandler];

@Module({
  imports: [CqrsModule],
  controllers: [GetAllCountriesController],
  providers: [CountryService, ...QueryHandlers],
  exports: [CountryService],
})
export class CountryModule {}
