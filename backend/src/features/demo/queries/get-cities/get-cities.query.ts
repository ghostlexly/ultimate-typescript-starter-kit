import type { DemoGetCitiesDto } from './get-cities.request.dto';

interface GetCitiesQueryProps {
  query: DemoGetCitiesDto['query'];
}

export class GetCitiesQuery {
  public readonly query: DemoGetCitiesDto['query'];

  constructor(props: GetCitiesQueryProps) {
    this.query = props.query;
  }
}
