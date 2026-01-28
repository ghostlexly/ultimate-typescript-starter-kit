import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { GetAllCountriesController } from './queries/get-all-countries/get-all-countries.http.controller';
import { GetAllCountriesQueryHandler } from './queries/get-all-countries/get-all-countries.query-handler';

const QueryHandlers = [GetAllCountriesQueryHandler];

@Module({
  imports: [],
  controllers: [GetAllCountriesController],
  providers: [CountryService, ...QueryHandlers],
  exports: [CountryService],
})
export class CountryModule {}
