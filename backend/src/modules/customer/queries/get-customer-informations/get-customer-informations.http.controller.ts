import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from 'src/modules/core/decorators/roles.decorator';
import { GetCustomerInformationsHandler } from './get-customer-informations.handler';

@Controller()
export class GetCustomerInformationsController {
  constructor(private readonly handler: GetCustomerInformationsHandler) {}

  @Get('/customer/informations')
  @Roles(['CUSTOMER'])
  async getCustomerInformations(@Req() req: Request) {
    const { user } = req;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.handler.execute({ accountId: user.accountId });
  }
}
