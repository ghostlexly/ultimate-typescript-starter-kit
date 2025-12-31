import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { type Request } from 'express';
import { Roles } from 'src/core/decorators/roles.decorator';
import { GetProtectedRouteCustomerQuery } from './get-protected-route-customer.query';

@Controller()
export class GetProtectedRouteCustomerHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos/protected-route-customer')
  @Roles(['CUSTOMER'])
  async getProtectedRouteCustomer(@Req() req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    const result = await this.queryBus.execute(
      new GetProtectedRouteCustomerQuery(user.accountId),
    );

    return {
      message: 'Protected route for customer.',
      sessionId: user.sessionId,
      role: user.role,
      accountId: user.accountId,
      email: user.email,
      customerId: result.customerId,
    };
  }
}
