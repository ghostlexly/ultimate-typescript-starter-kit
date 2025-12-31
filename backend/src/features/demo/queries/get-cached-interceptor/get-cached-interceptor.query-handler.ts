import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCachedInterceptorQuery } from './get-cached-interceptor.query';

@QueryHandler(GetCachedInterceptorQuery)
export class GetCachedInterceptorQueryHandler
  implements IQueryHandler<GetCachedInterceptorQuery>
{
  execute(): Promise<{ message: string; date: string }> {
    return Promise.resolve({
      message: 'Cached response.',
      date: new Date().toISOString(),
    });
  }
}
