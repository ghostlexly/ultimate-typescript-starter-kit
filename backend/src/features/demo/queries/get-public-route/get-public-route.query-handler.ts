import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPublicRouteQuery } from './get-public-route.query';

@QueryHandler(GetPublicRouteQuery)
export class GetPublicRouteQueryHandler
  implements IQueryHandler<GetPublicRouteQuery>
{
  execute() {
    return Promise.resolve({
      message: 'Public route.',
    });
  }
}
