import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCitiesQuery } from './get-cities.query';
import { DatabaseService } from 'src/features/application/services/database.service';
import {
  buildQueryParams,
  transformWithPagination,
} from 'src/core/utils/page-query';
import { Prisma } from 'src/generated/prisma/client';

@QueryHandler(GetCitiesQuery)
export class GetCitiesQueryHandler implements IQueryHandler<GetCitiesQuery> {
  constructor(private readonly db: DatabaseService) {}

  async execute({ query }: GetCitiesQuery) {
    const filterConditions: Prisma.CityWhereInput[] = [];

    const { pagination, orderBy } = buildQueryParams({
      query,
      defaultSort: { population: 'desc' },
      allowedSortFields: ['population', 'id', 'name'],
    });

    if (query.search) {
      filterConditions.push({
        OR: [
          {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            postalCodes: {
              some: {
                postalCode: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
      });
    }

    const { data, count } = await this.db.prisma.city.findManyAndCount({
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
