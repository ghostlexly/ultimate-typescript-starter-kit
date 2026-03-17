interface SignInCommandProps {
  email: string;
  password: string;
}

export class SignInCommand {
  public readonly email: string;
  public readonly password: string;

  constructor(props: SignInCommandProps) {
    Object.assign(this, props);
  }
}
