import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

@Controller()
export class GetCurrentUserController {
  @Get('/auth/me')
  async getMe(@Req() req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      accountId: user.accountId,
      email: user.email,
      role: user.role,
    };
  }
}
