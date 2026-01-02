interface ForgotPasswordCommandProps {
  email: string;
}

export class ForgotPasswordCommand {
  public readonly email: string;

  constructor(props: ForgotPasswordCommandProps) {
    this.email = props.email;
  }
}
