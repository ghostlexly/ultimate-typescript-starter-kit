import { VerificationToken, VerificationType } from '../entities';

export const VERIFICATION_TOKEN_REPOSITORY = Symbol(
  'VERIFICATION_TOKEN_REPOSITORY',
);

export interface VerificationTokenRepositoryPort {
  findByTokenAndType(
    token: string,
    type: VerificationType,
    accountEmail?: string,
  ): Promise<VerificationToken | null>;
  findByAccountIdAndType(
    accountId: string,
    type: VerificationType,
  ): Promise<VerificationToken | null>;
  save(token: VerificationToken): Promise<void>;
  deleteByAccountIdAndType(
    accountId: string,
    type: VerificationType,
  ): Promise<void>;
  deleteExpired(): Promise<number>;
}
