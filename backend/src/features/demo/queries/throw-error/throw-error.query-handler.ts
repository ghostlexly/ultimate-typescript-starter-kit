import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ThrowErrorQuery } from './throw-error.query';

@QueryHandler(ThrowErrorQuery)
export class ThrowErrorQueryHandler implements IQueryHandler<ThrowErrorQuery> {
  execute(): Promise<never> {
    return Promise.reject(new Error('Unhandled error'));
  }
}
