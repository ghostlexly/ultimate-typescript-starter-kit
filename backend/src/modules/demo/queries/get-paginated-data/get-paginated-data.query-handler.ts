import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPaginatedDataQuery } from './get-paginated-data.query';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import {
  buildQueryParams,
  transformWithPagination,
} from 'src/modules/core/utils/page-query';
import { Prisma } from 'src/generated/prisma/client';

@QueryHandler(GetPaginatedDataQuery)
export class GetPaginatedDataQueryHandler
  implements IQueryHandler<GetPaginatedDataQuery>
{
  constructor(private readonly db: DatabaseService) {}

  async execute(command: GetPaginatedDataQuery) {
    const filterConditions: Prisma.CityWhereInput[] = [
      {
        population: {
          gte: 1000,
        },
      },
    ];

    const { pagination, orderBy, includes } = buildQueryParams({
      query: command.query,
      defaultSort: { inseeCode: 'asc' },
      allowedSortFields: [
        'inseeCode',
        'id',
        'postalCodes.postalCode',
        'postalCodes._count',
      ],
    });

    if (command.query.id) {
      filterConditions.push({
        id: {
          equals: command.query.id,
        },
      });
    }

    const { data, count } = await this.db.prisma.findManyAndCount('city', {
      include: {
        ...(includes.has('postalCodes') && { postalCodes: true }),
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
