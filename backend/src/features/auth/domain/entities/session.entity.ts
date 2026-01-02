import { Entity, EntityProps } from 'src/core/ddd/domain';

export interface SessionProps extends EntityProps {
  accountId: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
}

export interface CreateSessionProps {
  id: string;
  accountId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Session Entity
 *
 * Represents an authenticated user session.
 */
export class Session extends Entity<SessionProps> {
  private constructor(props: SessionProps) {
    super(props);
  }

  protected validate(): void {
    if (!this._props.accountId) {
      throw new Error('Account ID is required for session.');
    }

    if (!this._props.expiresAt) {
      throw new Error('Expiration date is required for session.');
    }
  }

  get accountId(): string {
    return this._props.accountId;
  }

  get ipAddress(): string | null {
    return this._props.ipAddress;
  }

  get userAgent(): string | null {
    return this._props.userAgent;
  }

  get expiresAt(): Date {
    return this._props.expiresAt;
  }

  get isExpired(): boolean {
    return this._props.expiresAt < new Date();
  }

  /**
   * Create a new session
   */
  static create(props: CreateSessionProps): Session {
    return new Session({
      id: props.id,
      accountId: props.accountId,
      expiresAt: props.expiresAt,
      ipAddress: props.ipAddress ?? null,
      userAgent: props.userAgent ?? null,
    });
  }

  /**
   * Reconstitute a session from persistence
   */
  static fromPersistence(props: SessionProps): Session {
    return new Session(props);
  }

  /**
   * Extend session expiration
   */
  extend(newExpiresAt: Date): void {
    this._props.expiresAt = newExpiresAt;
  }

  /**
   * Get data for Prisma
   */
  toPersistence(): SessionProps {
    return {
      id: this._props.id,
      accountId: this._props.accountId,
      ipAddress: this._props.ipAddress,
      userAgent: this._props.userAgent,
      expiresAt: this._props.expiresAt,
    };
  }
}
