import { BadRequestException } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { GetCustomerInformationsQuery } from './get-customer-informations.query';

@QueryHandler(GetCustomerInformationsQuery)
export class GetCustomerInformationsHandler
  implements IQueryHandler<GetCustomerInformationsQuery>
{
  constructor(private readonly db: DatabaseService) {}

  async execute({ accountId }: GetCustomerInformationsQuery) {
    const customerInformations = await this.db.prisma.customer.findFirst({
      where: {
        accountId: accountId,
      },
    });

    if (!customerInformations) {
      throw new BadRequestException("You don't have any information.");
    }

    return {
      countryCode: customerInformations.countryCode,
    };
  }
}
