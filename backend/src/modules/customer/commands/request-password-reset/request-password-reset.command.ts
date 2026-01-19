export class RequestPasswordResetCommand {
  public readonly email: string;

  constructor(props: { email: string }) {
    this.email = props.email;
  }
}
