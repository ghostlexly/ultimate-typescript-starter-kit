import { GetCitiesRequestDto } from './get-cities.request.dto';

export class GetCitiesQuery {
  public readonly query: GetCitiesRequestDto['query'];

  constructor(props: { query: GetCitiesRequestDto['query'] }) {
    this.query = props.query;
  }
}
