import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { GetPublicRouteQuery } from './get-public-route.query';

@Controller()
export class GetPublicRouteHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos/public-route')
  @AllowAnonymous()
  async getPublicRoute() {
    return this.queryBus.execute(new GetPublicRouteQuery());
  }
}
