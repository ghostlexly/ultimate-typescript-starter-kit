interface RequestPasswordResetCommandProps {
  email: string;
}

export class RequestPasswordResetCommand {
  public readonly email: string;

  constructor(props: RequestPasswordResetCommandProps) {
    this.email = props.email;
  }
}
