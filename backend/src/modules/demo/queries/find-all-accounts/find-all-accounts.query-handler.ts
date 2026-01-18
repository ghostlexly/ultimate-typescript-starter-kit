import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllAccountsQuery } from './find-all-accounts.query';
import { DatabaseService } from 'src/modules/shared/services/database.service';

@QueryHandler(FindAllAccountsQuery)
export class FindAllAccountsQueryHandler
  implements IQueryHandler<FindAllAccountsQuery>
{
  constructor(private readonly db: DatabaseService) {}

  async execute() {
    return await this.db.prisma.findManyAndCount('account', {});
  }
}
