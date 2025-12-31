import { Customer } from '../entities';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepositoryPort {
  findById(id: string): Promise<Customer | null>;
  findByAccountId(accountId: string): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
}
