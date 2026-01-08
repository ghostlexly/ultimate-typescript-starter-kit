import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { FindAllAccountsQuery } from './find-all-accounts.query';

@Controller()
export class FindAllAccountsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos')
  @AllowAnonymous()
  async findAll() {
    return this.queryBus.execute(new FindAllAccountsQuery());
  }
}
