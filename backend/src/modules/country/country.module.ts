import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { GetAllCountriesController } from './queries/get-all-countries/get-all-countries.http.controller';

@Module({
  imports: [],
  controllers: [GetAllCountriesController],
  providers: [CountryService],
  exports: [CountryService],
})
export class CountryModule {}
