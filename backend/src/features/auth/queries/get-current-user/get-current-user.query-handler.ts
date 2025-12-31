import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCurrentUserQuery } from './get-current-user.query';

export interface GetCurrentUserResult {
  accountId: string;
  email: string;
  role: string;
}

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserQueryHandler
  implements IQueryHandler<GetCurrentUserQuery, GetCurrentUserResult>
{
  execute(query: GetCurrentUserQuery): Promise<GetCurrentUserResult> {
    // For this simple query, we directly return the data from the JWT payload
    // No need to query the database

    return Promise.resolve({
      accountId: query.accountId,
      email: query.email,
      role: query.role,
    });
  }
}
