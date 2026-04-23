import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { buildQueryParams, transformWithPagination } from 'src/core/utils/page-query';
import { Prisma } from 'src/generated/prisma/client';
import { GetPaginatedDataCommand } from './get-paginated-data.command';

@CommandHandler(GetPaginatedDataCommand)
export class GetPaginatedDataHandler implements ICommandHandler<GetPaginatedDataCommand> {
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

    // -- Filters
    if (query.id) {
      filterConditions.push({
        id: {
          equals: query.id,
        },
      });
    }

    // if (query.status) {
    //   if (Array.isArray(query.status)) {
    //     filterConditions.push({
    //       status: {
    //         in: query.status,
    //       },
    //     });
    //   } else {
    //     filterConditions.push({
    //       status: query.status,
    //     });
    //   }
    // }

    // if (query.search) {
    //   filterConditions.push({
    //     OR: [
    //       {
    //         postalCode: {
    //           contains: query.search,
    //         },
    //       },
    //       {
    //         city: { contains: query.search },
    //       },
    //       {
    //         id: query.search,
    //       },
    //     ],
    //   });
    // }

    // if (query.fullName) {
    //   // Split the string by spaces and filter out empty strings
    //   const terms = query.fullName.split(' ').filter((term) => term.length > 0);
    //
    //   terms.flatMap((term) => {
    //     filterConditions.push({
    //       OR: [
    //         {
    //           firstName: {
    //             contains: term,
    //           },
    //         },
    //
    //         {
    //           lastName: {
    //             contains: term,
    //           },
    //         },
    //       ],
    //     });
    //   });
    // }

    // if (query.customer_informations) {
    //   // Split the string by spaces and filter out empty strings
    //   const terms = query.customer_informations
    //     .split(' ')
    //     .filter((term) => term.length > 0);
    //
    //   terms.flatMap((term) => {
    //     filterConditions.push({
    //       customer: {
    //         OR: [
    //           {
    //             informations: {
    //               OR: [
    //                 {
    //                   firstName: { contains: term },
    //                 },
    //                 {
    //                   lastName: { contains: term },
    //                 },
    //               ],
    //             },
    //           },
    //           {
    //             email: {
    //               contains: term,
    //             },
    //           },
    //         ],
    //       },
    //     });
    //   });
    // }

    // -- Sorting
    // if (sorting) {
    //   if (sorting.column === 'createdAt') {
    //     sortOptions = {
    //       createdAt: sorting.direction,
    //     };
    //   }
    // }

    // -- Query
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
