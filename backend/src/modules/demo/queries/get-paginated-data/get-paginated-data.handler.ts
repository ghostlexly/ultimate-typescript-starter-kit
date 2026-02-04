import { DatabaseService } from 'src/modules/shared/services/database.service';
import {
  buildQueryParams,
  transformWithPagination,
} from 'src/modules/core/utils/page-query';
import { Prisma } from 'src/generated/prisma/client';
import type { DemoGetPaginatedDataDto } from './get-paginated-data.request.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetPaginatedDataHandler {
  constructor(private readonly db: DatabaseService) {}

  async execute({ query }: { query: DemoGetPaginatedDataDto['query'] }) {
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
