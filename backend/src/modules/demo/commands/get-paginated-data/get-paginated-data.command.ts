import { Command } from '@nestjs/cqrs';
import { GetPaginatedDataQuery } from '../../dtos/get-paginated-data.request';
import { PageQueryResult } from '../../../../core/utils/page-query';

export type GetPaginatedDataCommandProps = {
  query: GetPaginatedDataQuery;
};

export class GetPaginatedDataCommand extends Command<PageQueryResult> {
  public readonly query: GetPaginatedDataQuery;

  constructor(props: GetPaginatedDataCommandProps) {
    super();
    Object.assign(this, props);
  }
}
