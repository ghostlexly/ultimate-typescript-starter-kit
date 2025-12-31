import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { GetThrottledQuery } from './get-throttled.query';

@Controller()
export class GetThrottledHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos/strict-throttler')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
  async getThrottled() {
    return this.queryBus.execute(new GetThrottledQuery());
  }
}
