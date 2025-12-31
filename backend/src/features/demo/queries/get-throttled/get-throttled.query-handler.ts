import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetThrottledQuery } from './get-throttled.query';

@QueryHandler(GetThrottledQuery)
export class GetThrottledQueryHandler
  implements IQueryHandler<GetThrottledQuery>
{
  execute() {
    return Promise.resolve({
      message: 'Strict throttler.',
    });
  }
}
