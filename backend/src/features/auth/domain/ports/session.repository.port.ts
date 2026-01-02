import { Session } from '../entities';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface SessionRepositoryPort {
  findById(id: string): Promise<Session | null>;
  findByAccountId(accountId: string): Promise<Session[]>;
  save(session: Session): Promise<void>;
  delete(id: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
