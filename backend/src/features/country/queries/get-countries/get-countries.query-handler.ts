import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCountriesQuery } from './get-countries.query';
import { CountryData, CountryService } from '../../country.service';

@QueryHandler(GetCountriesQuery)
export class GetCountriesQueryHandler
  implements IQueryHandler<GetCountriesQuery, CountryData[]>
{
  constructor(private readonly countryService: CountryService) {}

  execute(query: GetCountriesQuery): Promise<CountryData[]> {
    return Promise.resolve(this.countryService.getAllCountries(query.language));
  }
}
