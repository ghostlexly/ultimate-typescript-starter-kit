import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCachedServiceQuery } from './get-cached-service.query';

@QueryHandler(GetCachedServiceQuery)
export class GetCachedServiceQueryHandler
  implements IQueryHandler<GetCachedServiceQuery>
{
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async execute() {
    const cacheKey = 'cached-data';
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const data = {
      message: 'Cached response.',
      date: new Date().toISOString(),
    };

    await this.cacheManager.set(cacheKey, data, 5000);

    return data;
  }
}
