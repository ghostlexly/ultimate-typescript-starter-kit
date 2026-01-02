import type { Response } from 'express';

interface SignInCommandProps {
  email: string;
  password: string;
  res: Response;
}

export class SignInCommand {
  public readonly email: string;
  public readonly password: string;
  public readonly res: Response;

  constructor(props: SignInCommandProps) {
    this.email = props.email;
    this.password = props.password;
    this.res = props.res;
  }
}
