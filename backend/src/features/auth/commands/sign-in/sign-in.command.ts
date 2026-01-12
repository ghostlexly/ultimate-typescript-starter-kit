import type { Response } from 'express';
import { SignInInput } from './sign-in.schema';

interface SignInCommandProps {
  data: SignInInput;
  res: Response;
}

export class SignInCommand {
  public readonly data: SignInInput;
  public readonly res: Response;

  constructor(props: SignInCommandProps) {
    this.data = props.data;
    this.res = props.res;
  }
}
