import { DomainEvent } from './domain-event.base';

export interface EntityProps {
  id: string;
}

/**
 * Base Entity class
 *
 * Entities are objects with a unique identity that persists over time.
 * They can hold domain events that will be dispatched after persistence.
 */
export abstract class Entity<Props extends EntityProps> {
  protected readonly _props: Props;
  private _domainEvents: DomainEvent[] = [];

  protected constructor(props: Props) {
    this._props = props;
    this.validate();
  }

  /**
   * Validate entity invariants.
   * Called automatically in constructor.
   * Override in subclasses to add validation rules.
   */
  protected abstract validate(): void;

  abstract toPersistence(): unknown;

  get id(): string {
    return this._props.id;
  }

  /**
   * Add a domain event to be dispatched after persistence
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Get all pending domain events
   */
  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * Clear domain events (call after dispatching)
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Check equality by ID
   */
  equals(other?: Entity<Props>): boolean {
    if (!other) {
      return false;
    }

    return this.id === other.id;
  }
}
