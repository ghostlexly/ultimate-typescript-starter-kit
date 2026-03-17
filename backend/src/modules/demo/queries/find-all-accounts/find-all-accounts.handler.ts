import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { FindAllAccountsQuery } from './find-all-accounts.query';

@QueryHandler(FindAllAccountsQuery)
export class FindAllAccountsHandler implements IQueryHandler<FindAllAccountsQuery> {
  constructor(private readonly db: DatabaseService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(query: FindAllAccountsQuery) {
    return await this.db.prisma.findManyAndCount('account', {});
  }
}
