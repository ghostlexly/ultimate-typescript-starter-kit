import { GetCitiesInput } from './get-cities.schema';

interface GetCitiesQueryProps {
  query: GetCitiesInput;
}

export class GetCitiesQuery {
  public readonly query: GetCitiesInput;

  constructor(props: GetCitiesQueryProps) {
    this.query = props.query;
  }
}
