interface ResetPasswordCommandProps {
  token: string;
  password: string;
}

export class ResetPasswordCommand {
  public readonly token: string;
  public readonly password: string;

  constructor(props: ResetPasswordCommandProps) {
    this.token = props.token;
    this.password = props.password;
  }
}
