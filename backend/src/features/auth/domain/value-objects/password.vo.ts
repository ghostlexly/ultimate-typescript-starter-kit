import { HttpException, HttpStatus } from '@nestjs/common';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Password Value Object
 *
 * Encapsulates password validation and hashing logic.
 * Can be in two states: plain (not yet hashed) or hashed.
 */
export class Password {
  private readonly _value: string;
  private readonly _isHashed: boolean;

  private constructor(value: string, isHashed: boolean) {
    this._value = value;
    this._isHashed = isHashed;
  }

  get value(): string {
    return this._value;
  }

  get isHashed(): boolean {
    return this._isHashed;
  }

  /**
   * Create a new password from plain text (validates strength)
   */
  static create(plainPassword: string): Password {
    Password.validateStrength(plainPassword);

    return new Password(plainPassword, false);
  }

  /**
   * Reconstitute a hashed password from database
   */
  static fromHashed(hashedPassword: string): Password {
    return new Password(hashedPassword, true);
  }

  /**
   * Hash the password (returns a new Password instance)
   */
  async hash(): Promise<Password> {
    if (this._isHashed) {
      return this;
    }

    const hashed = await bcrypt.hash(this._value, SALT_ROUNDS);

    return new Password(hashed, true);
  }

  /**
   * Compare plain password with this (hashed) password
   */
  async compare(plainPassword: string): Promise<boolean> {
    if (!this._isHashed) {
      throw new Error('Cannot compare with unhashed password');
    }

    return await bcrypt.compare(plainPassword, this._value);
  }

  private static validateStrength(password: string): void {
    if (password.length < 8) {
      throw new HttpException(
        { message: 'Le mot de passe doit contenir au moins 8 caractères.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Add more rules as needed:
    // - Must contain uppercase
    // - Must contain number
    // - Must contain special character
  }
}
