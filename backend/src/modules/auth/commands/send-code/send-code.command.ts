interface SendCodeCommandProps {
  email: string;
}

export class SendCodeCommand {
  public readonly email: string;

  constructor(props: SendCodeCommandProps) {
    Object.assign(this, props);
  }
}