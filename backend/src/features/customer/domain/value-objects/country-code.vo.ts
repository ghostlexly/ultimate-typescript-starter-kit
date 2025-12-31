import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * CountryCode Value Object
 *
 * Represents a valid ISO 3166-1 alpha-2 country code.
 * Validates format only - existence check should be done in the service.
 */
export class CountryCode {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  /**
   * Factory method that validates the country code format
   */
  static create(code: string): CountryCode {
    const normalized = code.trim().toUpperCase();

    if (normalized.length !== 2) {
      throw new HttpException(
        { message: 'Le code pays doit contenir 2 caractères.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!/^[A-Z]{2}$/.test(normalized)) {
      throw new HttpException(
        { message: 'Le code pays doit contenir uniquement des lettres.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return new CountryCode(normalized);
  }

  /**
   * Reconstitute from database (no validation, already trusted)
   */
  static fromPersistence(code: string): CountryCode {
    return new CountryCode(code);
  }

  equals(other: CountryCode): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
