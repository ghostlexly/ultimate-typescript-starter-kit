import type { VerificationType } from 'src/generated/prisma/client';

interface VerifyTokenCommandProps {
  type: VerificationType;
  token: string;
  email: string;
}

export class VerifyTokenCommand {
  public readonly type: VerificationType;
  public readonly token: string;
  public readonly email: string;

  constructor(props: VerifyTokenCommandProps) {
    this.type = props.type;
    this.token = props.token;
    this.email = props.email;
  }
}
