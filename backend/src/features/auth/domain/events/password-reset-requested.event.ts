import {
  DomainEvent,
  DomainEventProps,
} from 'src/core/ddd/domain/domain-event.base';

interface PasswordResetRequestedEventProps extends DomainEventProps {
  email: string;
  resetToken: string;
}

export class PasswordResetRequestedEvent extends DomainEvent {
  public readonly email: string;
  public readonly resetToken: string;

  constructor(props: PasswordResetRequestedEventProps) {
    super(props);
    this.email = props.email;
    this.resetToken = props.resetToken;
  }

  get eventName(): string {
    return 'auth.password-reset.requested';
  }
}
