import { type PageQueryInput } from 'src/core/utils/page-query';

export class GetPaginatedDataQuery {
  constructor(public readonly query: PageQueryInput & { id?: string }) {}
}
