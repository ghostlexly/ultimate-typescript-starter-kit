import { type PageQueryInput } from 'src/core/utils/page-query';

export class GetCitiesQuery {
  constructor(public readonly query: PageQueryInput & { search?: string }) {}
}
