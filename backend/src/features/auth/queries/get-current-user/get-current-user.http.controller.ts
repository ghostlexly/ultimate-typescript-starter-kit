import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { GetCurrentUserQuery } from './get-current-user.query';

@Controller()
export class GetCurrentUserHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/auth/me')
  async getMe(@Req() req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.queryBus.execute(
      new GetCurrentUserQuery(user.accountId, user.email, user.role),
    );
  }
}
