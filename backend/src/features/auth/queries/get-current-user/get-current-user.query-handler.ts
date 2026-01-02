import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { GetCurrentUserQuery } from './get-current-user.query';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserQueryHandler
  implements IQueryHandler<GetCurrentUserQuery>
{
  // eslint-disable-next-line @typescript-eslint/require-await
  async execute({ user }: GetCurrentUserQuery) {
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
