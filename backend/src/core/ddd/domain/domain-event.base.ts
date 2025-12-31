export interface DomainEventProps {
  aggregateId: string;
  occurredAt?: Date;
  correlationId?: string;
}

export abstract class DomainEvent {
  public readonly aggregateId: string;
  public readonly occurredAt: Date;
  public readonly correlationId?: string;

  constructor(props: DomainEventProps) {
    this.aggregateId = props.aggregateId;
    this.occurredAt = props.occurredAt ?? new Date();
    this.correlationId = props.correlationId;
  }

  abstract get eventName(): string;
}
