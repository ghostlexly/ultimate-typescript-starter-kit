import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import {
  buildQueryParams,
  transformWithPagination,
} from 'src/core/utils/page-query';
import { Prisma } from 'src/generated/prisma/client';
import { GetPaginatedDataCommand } from './get-paginated-data.command';

@CommandHandler(GetPaginatedDataCommand)
export class GetPaginatedDataHandler
  implements ICommandHandler<GetPaginatedDataCommand>
{
  constructor(private readonly db: DatabaseService) {}

  async execute({ query }: GetPaginatedDataCommand) {
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
