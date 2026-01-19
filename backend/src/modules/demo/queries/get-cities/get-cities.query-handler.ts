import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCitiesQuery } from './get-cities.query';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import {
  buildQueryParams,
  transformWithPagination,
} from 'src/modules/core/utils/page-query';
import { Prisma } from 'src/generated/prisma/client';

@QueryHandler(GetCitiesQuery)
export class GetCitiesQueryHandler implements IQueryHandler<GetCitiesQuery> {
  constructor(private readonly db: DatabaseService) {}

  async execute(command: GetCitiesQuery) {
    const filterConditions: Prisma.CityWhereInput[] = [];

    const { pagination, orderBy } = buildQueryParams({
      query: command,
      defaultSort: { population: 'desc' },
      allowedSortFields: ['population', 'id', 'name'],
    });

    if (command.search) {
      filterConditions.push({
        OR: [
          {
            name: {
              contains: command.search,
              mode: 'insensitive',
            },
          },
          {
            postalCodes: {
              some: {
                postalCode: {
                  contains: command.search,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
      });
    }

    const { data, count } = await this.db.prisma.findManyAndCount('city', {
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
