import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { GetCountriesHttpController } from './queries/get-countries/get-countries.http.controller';
import { GetCountriesQueryHandler } from './queries/get-countries/get-countries.query-handler';

const QueryHandlers = [GetCountriesQueryHandler];

@Module({
  controllers: [GetCountriesHttpController],
  providers: [CountryService, ...QueryHandlers],
  exports: [CountryService],
})
export class CountryModule {}
