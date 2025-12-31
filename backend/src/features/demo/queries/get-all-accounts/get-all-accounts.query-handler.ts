import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllAccountsQuery } from './get-all-accounts.query';
import { DatabaseService } from 'src/features/application/services/database.service';

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsQueryHandler
  implements IQueryHandler<GetAllAccountsQuery>
{
  constructor(private readonly db: DatabaseService) {}

  async execute() {
    return this.db.prisma.account.findManyAndCount({});
  }
}
