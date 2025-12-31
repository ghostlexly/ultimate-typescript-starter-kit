import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPaginatedDataQuery } from './get-paginated-data.query';
import { DatabaseService } from 'src/features/application/services/database.service';
import {
  buildQueryParams,
  transformWithPagination,
} from 'src/core/utils/page-query';
import { Prisma } from 'src/generated/prisma/client';

@QueryHandler(GetPaginatedDataQuery)
export class GetPaginatedDataQueryHandler
  implements IQueryHandler<GetPaginatedDataQuery>
{
  constructor(private readonly db: DatabaseService) {}

  async execute(query: GetPaginatedDataQuery) {
    const filterConditions: Prisma.CustomerWhereInput[] = [
      {
        account: {
          role: 'CUSTOMER',
        },
      },
    ];

    const { pagination, orderBy, includes } = buildQueryParams({
      query: query.query,
      defaultSort: { createdAt: 'desc' },
      allowedSortFields: ['createdAt', 'id', 'barcodeAnalysis.productName'],
    });

    // --------------------------------------
    // Filters
    // --------------------------------------
    if (query.query.id) {
      filterConditions.push({
        id: {
          equals: query.query.id,
        },
      });
    }

    // --------------------------------------
    // Query
    // --------------------------------------
    const { data, count } = await this.db.prisma.customer.findManyAndCount({
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
