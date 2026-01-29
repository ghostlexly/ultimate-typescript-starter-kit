import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllCountriesQuery } from './get-all-countries.query';
import { CountryService } from '../../country.service';

@QueryHandler(GetAllCountriesQuery)
export class GetAllCountriesQueryHandler implements IQueryHandler<GetAllCountriesQuery> {
  constructor(private readonly countryService: CountryService) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(command: GetAllCountriesQuery) {
    return this.countryService.getAllCountries(command.language);
  }
}
