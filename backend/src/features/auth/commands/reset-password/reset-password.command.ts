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
    this.email = props.email;
    this.password = props.password;
    this.token = props.token;
  }
}
