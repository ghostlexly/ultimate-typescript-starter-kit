export class ResetPasswordCommand {
  public readonly token: string;
  public readonly password: string;

  constructor(props: { token: string; password: string }) {
    this.token = props.token;
    this.password = props.password;
  }
}
