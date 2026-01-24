import type { VerificationType } from 'src/generated/prisma/enums';

export class VerifyTokenCommand {
  public readonly type: VerificationType;
  public readonly token: string;
  public readonly email: string;

  constructor(props: { type: VerificationType; token: string; email: string }) {
    this.type = props.type;
    this.token = props.token;
    this.email = props.email;
  }
}
