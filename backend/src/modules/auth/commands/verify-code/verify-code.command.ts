interface VerifyCodeCommandProps {
  email: string;
  code: string;
}

export class VerifyCodeCommand {
  public readonly email: string;
  public readonly code: string;

  constructor(props: VerifyCodeCommandProps) {
    Object.assign(this, props);
  }
}