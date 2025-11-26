import { Controller, Get, Query } from '@nestjs/common';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { CountryService } from '../country.service';

@Controller('countries')
@AllowAnonymous()
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  getCountries(@Query('language') language: string = 'fr') {
    return this.countryService.getAllCountries(language);
  }
}
