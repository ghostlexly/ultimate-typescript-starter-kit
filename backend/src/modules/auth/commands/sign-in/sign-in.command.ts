import { Command } from '@nestjs/cqrs';
import { Role } from '../../../../generated/prisma/enums';

export class SignInCommand extends Command<{
  accessToken: string;
  refreshToken: string;
  role: Role;
}> {
  public readonly email: string;
  public readonly password: string;

  constructor(props: { email: string; password: string }) {
    super();
    this.email = props.email;
    this.password = props.password;
  }
}
