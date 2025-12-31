import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ThrowErrorQuery } from './throw-error.query';

@Controller()
export class ThrowErrorHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos/throw-unhandled-error')
  @AllowAnonymous()
  async throwError() {
    return this.queryBus.execute(new ThrowErrorQuery());
  }
}
