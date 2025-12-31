import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { GetProtectedRouteCustomerQuery } from './get-protected-route-customer.query';
import { DatabaseService } from 'src/features/application/services/database.service';

@QueryHandler(GetProtectedRouteCustomerQuery)
export class GetProtectedRouteCustomerQueryHandler
  implements IQueryHandler<GetProtectedRouteCustomerQuery>
{
  constructor(private readonly db: DatabaseService) {}

  async execute(query: GetProtectedRouteCustomerQuery) {
    const customer = await this.db.prisma.customer.findFirst({
      where: { accountId: query.accountId },
    });

    if (!customer) {
      throw new UnauthorizedException();
    }

    return {
      customerId: customer.id,
    };
  }
}
