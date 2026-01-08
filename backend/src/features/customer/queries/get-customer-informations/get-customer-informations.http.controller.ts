import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { Roles } from 'src/core/decorators/roles.decorator';
import { GetCustomerInformationsQuery } from './get-customer-informations.query';

@Controller()
export class GetCustomerInformationsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/customer/informations')
  @Roles(['CUSTOMER'])
  async getCustomerInformations(@Req() req: Request) {
    const { user } = req;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.queryBus.execute(
      new GetCustomerInformationsQuery({ accountId: user.accountId }),
    );
  }
}
