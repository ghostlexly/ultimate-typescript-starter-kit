import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { type Request } from 'express';
import { GetProtectedRouteQuery } from './get-protected-route.query';

@Controller()
export class GetProtectedRouteHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos/protected-route')
  async getProtectedRoute(@Req() req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.queryBus.execute(
      new GetProtectedRouteQuery(
        user.sessionId,
        user.role,
        user.accountId,
        user.email,
      ),
    );
  }
}
