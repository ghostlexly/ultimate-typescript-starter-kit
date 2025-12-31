import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Email Value Object
 *
 * Encapsulates email validation logic in one place.
 * Immutable - once created, cannot be changed.
 */
export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  /**
   * Factory method that validates and creates an Email
   * Throws if the email format is invalid
   */
  static create(email: string): Email {
    const trimmed = email.trim().toLowerCase();

    if (!Email.isValid(trimmed)) {
      throw new HttpException(
        { message: 'Format d\'adresse e-mail invalide.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return new Email(trimmed);
  }

  /**
   * Reconstitute from database (no validation, already trusted)
   */
  static fromPersistence(email: string): Email {
    return new Email(email);
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
