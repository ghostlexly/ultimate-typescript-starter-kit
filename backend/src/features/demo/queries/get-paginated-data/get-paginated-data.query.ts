import type { DemoGetPaginatedDataDto } from './get-paginated-data.request.dto';

interface GetPaginatedDataQueryProps {
  query: DemoGetPaginatedDataDto['query'];
}

export class GetPaginatedDataQuery {
  public readonly query: DemoGetPaginatedDataDto['query'];

  constructor(props: GetPaginatedDataQueryProps) {
    this.query = props.query;
  }
}
