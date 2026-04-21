import { Controller, Get, Query } from '@nestjs/common';
import { AllowAnonymous } from '../../../core/decorators/allow-anonymous.decorator';
import { GetAllCountriesQuery } from '../dtos/get-all-countries.request';
import { CountryService } from '../country.service';

@Controller()
@AllowAnonymous()
export class CountryPublicController {
  constructor(private readonly countryService: CountryService) {}

  @Get('/countries')
  getCountries(@Query() query: GetAllCountriesQuery) {
    return this.countryService.getAllCountries(query.language);
  }
}
