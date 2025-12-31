import { VerificationType } from 'src/generated/prisma/client';

export class VerifyTokenCommand {
  constructor(
    public readonly email: string,
    public readonly token: string,
    public readonly type: VerificationType,
  ) {}
}
