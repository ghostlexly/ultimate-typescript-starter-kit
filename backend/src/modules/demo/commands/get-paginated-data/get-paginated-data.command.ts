import type { GetPaginatedDataQuery } from '../../dtos/get-paginated-data.request';

interface GetPaginatedDataCommandProps {
  query: GetPaginatedDataQuery;
}

export class GetPaginatedDataCommand {
  public readonly query: GetPaginatedDataQuery;

  constructor(props: GetPaginatedDataCommandProps) {
    Object.assign(this, props);
  }
}
