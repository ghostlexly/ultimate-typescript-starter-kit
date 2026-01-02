import { HttpException, HttpStatus } from '@nestjs/common';
import { Entity, EntityProps } from 'src/core/ddd/domain';
import { Email, Password } from '../value-objects';
import { AccountCreatedEvent } from '../events/account-created.event';
import { PasswordResetRequestedEvent } from '../events/password-reset-requested.event';

export type Role = 'ADMIN' | 'CUSTOMER';

export interface AccountProps extends EntityProps {
  email: string;
  password: string | null;
  role: Role;
  providerId: string | null;
  providerAccountId: string | null;
  isEmailVerified: boolean;
}

export interface CreateAccountProps {
  id: string;
  email: Email;
  password: Password;
  role: Role;
}

export interface CreateOAuthAccountProps {
  id: string;
  email: Email;
  role: Role;
  providerId: string;
  providerAccountId: string;
}

/**
 * Account Entity
 *
 * Represents a user account with authentication capabilities.
 * Encapsulates all business rules related to account management.
 */
export class Account extends Entity<AccountProps> {
  private constructor(props: AccountProps) {
    super(props);
  }

  protected validate(): void {
    const VALID_ROLES = new Set<Role>(['ADMIN', 'CUSTOMER']);

    if (!VALID_ROLES.has(this._props.role)) {
      throw new HttpException(
        { message: 'Invalid role.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isOAuth = this._props.providerId !== null;

    if (!isOAuth && !this._props.password) {
      throw new HttpException(
        { message: 'Password is required for non-OAuth accounts.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (isOAuth && !this._props.providerAccountId) {
      throw new HttpException(
        { message: 'Provider account ID is required for OAuth accounts.' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  get email(): string {
    return this._props.email;
  }

  get password(): string | null {
    return this._props.password;
  }

  get role(): Role {
    return this._props.role;
  }

  get providerId(): string | null {
    return this._props.providerId;
  }

  get providerAccountId(): string | null {
    return this._props.providerAccountId;
  }

  get isEmailVerified(): boolean {
    return this._props.isEmailVerified;
  }

  get isOAuthAccount(): boolean {
    return this._props.providerId !== null;
  }

  /**
   * Create a new account with email/password
   */
  static async create(props: CreateAccountProps): Promise<Account> {
    const hashedPassword = await props.password.hash();

    const account = new Account({
      id: props.id,
      email: props.email.value,
      password: hashedPassword.value,
      role: props.role,
      providerId: null,
      providerAccountId: null,
      isEmailVerified: false,
    });

    account.addDomainEvent(
      new AccountCreatedEvent({
        aggregateId: account.id,
        email: account.email,
        role: account.role,
      }),
    );

    return account;
  }

  /**
   * Create a new OAuth account (Google, GitHub, etc.)
   */
  static createOAuth(props: CreateOAuthAccountProps): Account {
    const account = new Account({
      id: props.id,
      email: props.email.value,
      password: null,
      role: props.role,
      providerId: props.providerId,
      providerAccountId: props.providerAccountId,
      isEmailVerified: true, // OAuth accounts are pre-verified
    });

    account.addDomainEvent(
      new AccountCreatedEvent({
        aggregateId: account.id,
        email: account.email,
        role: account.role,
      }),
    );

    return account;
  }

  /**
   * Reconstitute an account from persistence
   */
  static fromPersistence(props: AccountProps) {
    return new Account(props);
  }

  /**
   * Validate password against stored hash
   */
  async validatePassword(plainPassword: string): Promise<boolean> {
    if (!this._props.password) {
      return false; // OAuth accounts can't validate password
    }

    const storedPassword = Password.fromHashed(this._props.password);

    return storedPassword.compare(plainPassword);
  }

  /**
   * Change the account password
   */
  async changePassword(newPassword: Password): Promise<void> {
    if (this.isOAuthAccount) {
      throw new Error('Cannot change password for OAuth accounts');
    }

    const hashedPassword = await newPassword.hash();
    this._props.password = hashedPassword.value;
  }

  /**
   * Mark email as verified
   */
  verifyEmail(): void {
    if (this._props.isEmailVerified) {
      return; // Already verified
    }

    this._props.isEmailVerified = true;
  }

  /**
   * Request a password reset
   */
  requestPasswordReset(resetToken: string): void {
    if (this.isOAuthAccount) {
      throw new Error('Cannot reset password for OAuth accounts');
    }

    this.addDomainEvent(
      new PasswordResetRequestedEvent({
        aggregateId: this.id,
        email: this.email,
        resetToken,
      }),
    );
  }

  /**
   * Get data for Prisma
   */
  toPersistence(): AccountProps {
    return {
      id: this._props.id,
      email: this._props.email,
      password: this._props.password,
      role: this._props.role,
      providerId: this._props.providerId,
      providerAccountId: this._props.providerAccountId,
      isEmailVerified: this._props.isEmailVerified,
    };
  }
}
