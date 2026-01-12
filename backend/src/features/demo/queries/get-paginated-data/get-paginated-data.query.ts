import { GetPaginatedDataInput } from './get-paginated-data.schema';

interface GetPaginatedDataQueryProps {
  query: GetPaginatedDataInput;
}

export class GetPaginatedDataQuery {
  public readonly query: GetPaginatedDataInput;

  constructor(props: GetPaginatedDataQueryProps) {
    this.query = props.query;
  }
}
