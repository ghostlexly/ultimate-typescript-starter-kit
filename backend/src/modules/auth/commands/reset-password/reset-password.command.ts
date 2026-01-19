export class ResetPasswordCommand {
  public readonly email: string;
  public readonly password: string;
  public readonly token: string;

  constructor(props: { email: string; password: string; token: string }) {
    this.email = props.email;
    this.password = props.password;
    this.token = props.token;
  }
}
