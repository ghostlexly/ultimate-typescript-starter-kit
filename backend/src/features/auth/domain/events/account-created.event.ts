import {
  DomainEvent,
  DomainEventProps,
} from 'src/core/ddd/domain/domain-event.base';

type Role = 'ADMIN' | 'CUSTOMER';

interface AccountCreatedEventProps extends DomainEventProps {
  email: string;
  role: Role;
}

export class AccountCreatedEvent extends DomainEvent {
  public readonly email: string;
  public readonly role: Role;

  constructor(props: AccountCreatedEventProps) {
    super(props);
    this.email = props.email;
    this.role = props.role;
  }

  get eventName(): string {
    return 'auth.account.created';
  }
}
