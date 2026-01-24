import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GetCustomerInformationsQuery } from './get-customer-informations.query';
import { DatabaseService } from 'src/modules/shared/services/database.service';

@QueryHandler(GetCustomerInformationsQuery)
export class GetCustomerInformationsQueryHandler
  implements IQueryHandler<GetCustomerInformationsQuery>
{
  constructor(private readonly db: DatabaseService) {}

  async execute(command: GetCustomerInformationsQuery) {
    const customerInformations = await this.db.prisma.customer.findFirst({
      include: {
        city: true,
      },
      where: {
        accountId: command.accountId,
      },
    });

    if (!customerInformations) {
      throw new HttpException(
        "You don't have any information",
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      countryCode: customerInformations.countryCode,
      city: customerInformations.city,
    };
  }
}
