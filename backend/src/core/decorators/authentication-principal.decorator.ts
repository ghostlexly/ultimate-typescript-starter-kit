import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { UserPrincipal } from '../types/request';

/**
 * @description Decorator to extract the current authenticated user from the request.
 * Use this in controllers protected by @Roles() to avoid manual null checks.
 *
 * @example
 * @Get('/me')
 * @Roles(['CUSTOMER'])
 * async getMe(@AuthenticationPrincipal() principal: UserPrincipal) {
 *   return this.handler.execute({ accountId: principal.accountId });
 * }
 */
export const AuthenticationPrincipal = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserPrincipal => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return request.user!;
  },
);
