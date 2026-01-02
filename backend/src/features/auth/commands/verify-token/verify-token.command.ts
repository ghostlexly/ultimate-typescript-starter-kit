import { VerificationType } from '../../domain/entities';

export class VerifyTokenCommand {
  constructor(
    public readonly email: string,
    public readonly token: string,
    public readonly type: VerificationType,
  ) {}
}
