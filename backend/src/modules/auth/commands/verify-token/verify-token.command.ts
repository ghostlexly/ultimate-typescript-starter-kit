import type { VerificationType } from 'src/generated/prisma/enums';

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
    Object.assign(this, props);
  }
}
