import {
  DomainEvent,
  DomainEventProps,
} from 'src/core/ddd/domain/domain-event.base';

interface CustomerCreatedEventProps extends DomainEventProps {
  customerId: string;
  accountId: string;
  email: string;
}

export class CustomerCreatedEvent extends DomainEvent {
  readonly customerId: string;
  readonly accountId: string;
  readonly email: string;

  constructor(props: CustomerCreatedEventProps) {
    super(props);
    this.customerId = props.customerId;
    this.accountId = props.accountId;
    this.email = props.email;
  }

  get eventName(): string {
    return 'customer.created';
  }
}
