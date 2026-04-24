import { Command } from '@nestjs/cqrs';
import { Role } from '../../../../generated/prisma/enums';

export class VerifyCodeCommand extends Command<{
  role: Role;
  accessToken: string;
  refreshToken: string;
}> {
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {
    super();
  }
}
