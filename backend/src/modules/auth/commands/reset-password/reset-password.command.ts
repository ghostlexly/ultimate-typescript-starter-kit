interface ResetPasswordCommandProps {
  email: string;
  password: string;
  token: string;
}

export class ResetPasswordCommand {
  public readonly email: string;
  public readonly password: string;
  public readonly token: string;

  constructor(props: ResetPasswordCommandProps) {
    Object.assign(this, props);
  }
}