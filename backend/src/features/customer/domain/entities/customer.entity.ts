import { HttpException, HttpStatus } from '@nestjs/common';
import { Entity, EntityProps } from 'src/core/ddd/domain';
import { CountryCode } from '../value-objects';
import { CustomerCreatedEvent } from '../events/customer-created.event';
import { CustomerInformationsUpdatedEvent } from '../events/customer-informations-updated.event';

export interface CustomerProps extends EntityProps {
  accountId: string;
  email: string;
  countryCode: string | null;
  cityId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCustomerProps {
  id: string;
  accountId: string;
  email: string;
}

/**
 * Customer Entity
 *
 * Represents a customer with their profile information.
 * Linked to an Account for authentication.
 */
export class Customer extends Entity<CustomerProps> {
  private constructor(props: CustomerProps) {
    super(props);
  }

  protected validate(): void {
    if (!this._props.accountId || this._props.accountId.trim() === '') {
      throw new HttpException(
        { message: 'Account ID is required.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!this._props.email || this._props.email.trim() === '') {
      throw new HttpException(
        { message: 'Email is required.' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  get accountId(): string {
    return this._props.accountId;
  }

  get email(): string {
    return this._props.email;
  }

  get countryCode(): string | null {
    return this._props.countryCode;
  }

  get cityId(): string | null {
    return this._props.cityId;
  }

  get hasCompleteProfile(): boolean {
    return this._props.countryCode !== null && this._props.cityId !== null;
  }

  /**
   * Create a new customer
   */
  static create(props: CreateCustomerProps): Customer {
    const customer = new Customer({
      id: props.id,
      accountId: props.accountId,
      email: props.email,
      countryCode: null,
      cityId: null,
    });

    customer.addDomainEvent(
      new CustomerCreatedEvent({
        aggregateId: customer.id,
        customerId: customer.id,
        accountId: customer.accountId,
        email: customer.email,
      }),
    );

    return customer;
  }

  /**
   * Reconstitute a customer from persistence (no validation, no events)
   */
  static fromPersistence(props: CustomerProps): Customer {
    return new Customer(props);
  }

  /**
   * Get data for Prisma update
   */
  toPersistence(): Omit<
    CustomerProps,
    'id' | 'accountId' | 'email' | 'createdAt'
  > {
    return {
      countryCode: this._props.countryCode,
      cityId: this._props.cityId,
    };
  }

  /**
   * Update customer location information
   */
  updateInformations(countryCode: CountryCode, cityId: string): void {
    const hasChanged =
      this._props.countryCode !== countryCode.value ||
      this._props.cityId !== cityId;

    if (!hasChanged) {
      return;
    }

    this._props.countryCode = countryCode.value;
    this._props.cityId = cityId;

    this.addDomainEvent(
      new CustomerInformationsUpdatedEvent({
        aggregateId: this.id,
        customerId: this.id,
        countryCode: countryCode.value,
        cityId,
      }),
    );
  }
}
