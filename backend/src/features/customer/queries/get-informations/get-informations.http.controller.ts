import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { type Request } from 'express';
import { Roles } from 'src/core/decorators/roles.decorator';
import { GetInformationsQuery } from './get-informations.query';

@Controller()
export class GetInformationsHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/customer/informations')
  @Roles(['CUSTOMER'])
  async getInformations(@Req() req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.queryBus.execute(new GetInformationsQuery(user.accountId));
  }
}
