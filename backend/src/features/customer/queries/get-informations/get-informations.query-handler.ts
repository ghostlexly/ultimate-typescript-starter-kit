import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GetInformationsQuery } from './get-informations.query';
import { DatabaseService } from 'src/features/application/services/database.service';

export interface GetInformationsResult {
  countryCode: string | null;
  city: {
    id: string;
    name: string;
  } | null;
}

@QueryHandler(GetInformationsQuery)
export class GetInformationsQueryHandler
  implements IQueryHandler<GetInformationsQuery, GetInformationsResult>
{
  constructor(private readonly db: DatabaseService) {}

  async execute(query: GetInformationsQuery): Promise<GetInformationsResult> {
    const customer = await this.db.prisma.customer.findFirst({
      include: {
        city: true,
      },
      where: {
        accountId: query.accountId,
      },
    });

    if (!customer) {
      throw new HttpException(
        { message: "You don't have any information" },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      countryCode: customer.countryCode,
      city: customer.city,
    };
  }
}
