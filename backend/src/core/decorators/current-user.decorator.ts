import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { RequestUser } from '../types/request';

/**
 * @description Decorator to extract the current authenticated user from the request.
 * Use this in controllers protected by @Roles() to avoid manual null checks.
 *
 * @example
 * @Get('/me')
 * @Roles(['CUSTOMER'])
 * async getMe(@CurrentUser() user: RequestUser) {
 *   return this.handler.execute({ accountId: user.accountId });
 * }
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestUser => {
  const request = ctx.switchToHttp().getRequest<Request>();

  return request.user!;
});