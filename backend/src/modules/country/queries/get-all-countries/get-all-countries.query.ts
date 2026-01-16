import { GetAllCountriesInput } from './get-all-countries.schema';

interface GetAllCountriesQueryProps {
  query: GetAllCountriesInput;
}

export class GetAllCountriesQuery {
  public readonly query: GetAllCountriesInput;

  constructor(props: GetAllCountriesQueryProps) {
    this.query = props.query;
  }
}
