import type { Response } from 'express';

export class SignInCommand {
  public readonly email: string;
  public readonly password: string;
  public readonly res: Response;

  constructor(props: { email: string; password: string; res: Response }) {
    this.email = props.email;
    this.password = props.password;
    this.res = props.res;
  }
}
