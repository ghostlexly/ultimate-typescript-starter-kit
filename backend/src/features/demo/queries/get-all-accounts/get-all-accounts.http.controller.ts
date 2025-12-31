import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { GetAllAccountsQuery } from './get-all-accounts.query';

@Controller()
export class GetAllAccountsHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos')
  @AllowAnonymous()
  async getAllAccounts() {
    return this.queryBus.execute(new GetAllAccountsQuery());
  }
}
