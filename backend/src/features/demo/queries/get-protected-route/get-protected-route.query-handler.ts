import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProtectedRouteQuery } from './get-protected-route.query';

@QueryHandler(GetProtectedRouteQuery)
export class GetProtectedRouteQueryHandler
  implements IQueryHandler<GetProtectedRouteQuery>
{
  execute(query: GetProtectedRouteQuery) {
    return Promise.resolve({
      message: 'Protected route.',
      sessionId: query.sessionId,
      role: query.role,
      accountId: query.accountId,
      email: query.email,
    });
  }
}
