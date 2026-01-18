import type { DemoGetPaginatedDataDto } from './get-paginated-data.request.dto';

export class GetPaginatedDataQuery {
  public readonly query: DemoGetPaginatedDataDto['query'];

  constructor(props: { query: DemoGetPaginatedDataDto['query'] }) {
    this.query = props.query;
  }
}
