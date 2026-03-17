import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import {
  buildQueryParams,
  transformWithPagination,
} from 'src/core/utils/page-query';
import { Prisma } from 'src/generated/prisma/client';
import { GetPaginatedDataQuery } from './get-paginated-data.query';

@QueryHandler(GetPaginatedDataQuery)
export class GetPaginatedDataHandler implements IQueryHandler<GetPaginatedDataQuery> {
  constructor(private readonly db: DatabaseService) {}

  async execute({ query }: GetPaginatedDataQuery) {
    const filterConditions: Prisma.CustomerWhereInput[] = [
      {
        countryCode: {
          equals: 'FR',
        },
      },
    ];

    const { pagination, orderBy, includes } = buildQueryParams({
      query: query,
      defaultSort: { createdAt: 'asc' },
      allowedSortFields: ['countryCode', 'account.email', 'account._count'],
    });

    if (query.id) {
      filterConditions.push({
        id: {
          equals: query.id,
        },
      });
    }

    const { data, count } = await this.db.prisma.findManyAndCount('customer', {
      include: {
        ...(includes.has('account') && { account: true }),
      },
      where: {
        AND: filterConditions,
      },
      orderBy: orderBy,
      take: pagination.take,
      skip: pagination.skip,
    });

    return transformWithPagination({
      data: data,
      count,
      page: pagination.currentPage,
      first: pagination.itemsPerPage,
    });
  }
}
