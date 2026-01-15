import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FindAllAccountsQuery } from './find-all-accounts.query';
import { DatabaseService } from 'src/features/application/services/database.service';

@QueryHandler(FindAllAccountsQuery)
export class FindAllAccountsQueryHandler
  implements IQueryHandler<FindAllAccountsQuery>
{
  constructor(private readonly db: DatabaseService) {}

  async execute(_query: FindAllAccountsQuery) {
    return await this.db.prisma.findManyAndCount('account', {});
  }
}
