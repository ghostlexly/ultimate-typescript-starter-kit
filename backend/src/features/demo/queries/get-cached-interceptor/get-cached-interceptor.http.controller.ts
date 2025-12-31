import {
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { GetCachedInterceptorQuery } from './get-cached-interceptor.query';

@Controller()
export class GetCachedInterceptorHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos/cached-by-interceptor')
  @AllowAnonymous()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('cached-response')
  @CacheTTL(5000) // 5 seconds
  async getCachedInterceptor() {
    return this.queryBus.execute(new GetCachedInterceptorQuery());
  }
}
