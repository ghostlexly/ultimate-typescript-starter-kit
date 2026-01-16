import { Controller, Get, Req } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { GetCurrentUserQuery } from './get-current-user.query';

@Controller()
export class GetCurrentUserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/auth/me')
  async getMe(@Req() req: Request) {
    return this.queryBus.execute(new GetCurrentUserQuery({ user: req.user }));
  }
}
