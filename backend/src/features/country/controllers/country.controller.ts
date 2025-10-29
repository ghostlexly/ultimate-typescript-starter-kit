import { Controller, Get } from '@nestjs/common';
import * as countries from 'i18n-iso-countries';
import { Public } from 'src/core/decorators/is-public.decorator';

@Controller('countries')
@Public()
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
