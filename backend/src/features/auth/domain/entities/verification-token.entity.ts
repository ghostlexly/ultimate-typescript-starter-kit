import { Entity, EntityProps } from 'src/core/ddd/domain';

export type VerificationType =
  | 'PASSWORD_RESET'
  | 'EMAIL_VERIFICATION'
  | 'TWO_FACTOR';

export interface VerificationTokenProps extends EntityProps {
  token: string;
  type: VerificationType;
  value: string | null;
  accountId: string;
  expiresAt: Date;
}

export interface CreateVerificationTokenProps {
  id: string;
  token: string;
  type: VerificationType;
  accountId: string;
  expiresAt: Date;
  value?: string;
}

/**
 * VerificationToken Entity
 *
 * Represents a token used for email verification or password reset.
 */
export class VerificationToken extends Entity<VerificationTokenProps> {
  private constructor(props: VerificationTokenProps) {
    super(props);
  }

  protected validate(): void {
    if (!this._props.token) {
      throw new Error('Token is required.');
    }

    if (!this._props.accountId) {
      throw new Error('Account ID is required.');
    }

    if (!this._props.expiresAt) {
      throw new Error('Expiration date is required.');
    }
  }

  get token(): string {
    return this._props.token;
  }

  get type(): VerificationType {
    return this._props.type;
  }

  get value(): string | null {
    return this._props.value;
  }

  get accountId(): string {
    return this._props.accountId;
  }

  get expiresAt(): Date {
    return this._props.expiresAt;
  }

  get isExpired(): boolean {
    return this._props.expiresAt < new Date();
  }

  get isValid(): boolean {
    return !this.isExpired;
  }

  /**
   * Create a new verification token
   */
  static create(props: CreateVerificationTokenProps): VerificationToken {
    return new VerificationToken({
      id: props.id,
      token: props.token,
      type: props.type,
      accountId: props.accountId,
      expiresAt: props.expiresAt,
      value: props.value ?? null,
    });
  }

  /**
   * Reconstitute a verification token from persistence
   */
  static fromPersistence(props: VerificationTokenProps): VerificationToken {
    return new VerificationToken(props);
  }

  /**
   * Get data for Prisma
   */
  toPersistence(): VerificationTokenProps {
    return {
      id: this._props.id,
      token: this._props.token,
      type: this._props.type,
      value: this._props.value,
      accountId: this._props.accountId,
      expiresAt: this._props.expiresAt,
    };
  }
}
