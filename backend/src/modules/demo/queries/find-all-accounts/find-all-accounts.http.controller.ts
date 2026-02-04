import { Controller, Get } from '@nestjs/common';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { FindAllAccountsHandler } from './find-all-accounts.handler';

@Controller()
export class FindAllAccountsController {
  constructor(private readonly handler: FindAllAccountsHandler) {}

  @Get('/demos')
  @AllowAnonymous()
  async findAll() {
    return this.handler.execute();
  }
}
