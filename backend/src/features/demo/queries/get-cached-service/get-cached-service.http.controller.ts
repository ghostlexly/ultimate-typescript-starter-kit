import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { GetCachedServiceQuery } from './get-cached-service.query';

@Controller()
export class GetCachedServiceHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos/cached-by-service')
  @AllowAnonymous()
  async getCachedService() {
    return this.queryBus.execute(new GetCachedServiceQuery());
  }
}
