import { Controller, Get } from '@nestjs/common';
import * as countries from 'i18n-iso-countries';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';

@Controller('countries')
@AllowAnonymous()
export class CountryController {
  @Get()
  getCountries() {
    // Set the locale to 'fr' for French names
    const data = countries.getNames('fr');

    // return data as countryName and countryCode
    const transformed = Object.entries(data).map(
      ([countryCode, countryName]) => ({
        countryCode,
        countryName,
      }),
    );

    return transformed;
  }
}
