import { Account } from '../entities';
import { Email } from '../value-objects';

export const ACCOUNT_REPOSITORY = Symbol('ACCOUNT_REPOSITORY');

export interface AccountRepositoryPort {
  findByEmail(email: Email): Promise<Account | null>;
  findById(id: string): Promise<Account | null>;
  save(account: Account): Promise<void>;
}
